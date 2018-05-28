import { EventEmitter } from 'events';
import { Socket, SocketConnectOpts } from 'net';
import { RebirthdbError } from './error';
import { NULL_BUFFER, buildAuthBuffer, compareDigest, computeSaltedPassword, validateVersion } from './handshake';
import { QueryJson, ResponseJson } from './internal-types';
import { Response } from './proto/ql2';

export class RebirthDBSocket extends EventEmitter {
  public port: number;
  public host: string;
  public readonly user: string;
  public readonly password: Buffer;
  public runningQueries: number[] = [];
  public lastError?: Error;
  public get status() {
    if (!!this.lastError) {
      return 'errored';
    } else if (!this.isOpen) {
      return 'closed';
    } else if (this.mode === 'handshake') {
      return 'handshake';
    }
    return 'open';
  }
  private isOpen = false;
  private socket?: Socket;
  private nextToken = 0;
  private buffer = new Buffer(0);
  private mode: 'handshake' | 'response' = 'handshake';
  private data: Array<ResponseJson | ((arg: ResponseJson) => void)> = [];

  constructor({
    port = 28015,
    host = 'localhost',
    user = 'admin',
    password = NULL_BUFFER
  } = {}) {
    super();
    this.port = port;
    this.host = host;
    this.user = user;
    this.password = password;
  }

  public async connect(
    options: Partial<SocketConnectOpts> = {},
    { host = this.host, port = this.port } = {}
  ) {
    this.host = host;
    this.port = port;
    if (this.socket) {
      throw new RebirthdbError('Socket already connected');
    }
    const socket = new Socket()
      .on('close', () => this.close())
      .on('error', error => this.handleError(error))
      .on('data', data => {
        try {
          this.buffer = Buffer.concat([this.buffer, data]);
          switch (this.mode) {
            case 'handshake':
              this.handleHandshakeData();
              break;
            case 'response':
              this.handleData();
              break;
          }
        } catch (error) {
          this.handleError(error);
        }
      });
    this.socket = socket;
    await new Promise(resolve =>
      socket.connect({ port, host, ...options }, resolve)
    );
    socket.setKeepAlive(true);
    this.isOpen = true;
    await this.performHandshake();
    this.emit('connect');
  }

  public sendQuery(query: QueryJson, token = this.nextToken++) {
    if (!this.socket || this.status !== 'open') {
      throw new RebirthdbError('Connection is not open');
    }
    const encoded = JSON.stringify(query);
    const querySize = Buffer.byteLength(encoded);
    const buffer = new Buffer(8 + 4 + querySize);
    // tslint:disable-next-line:no-bitwise
    buffer.writeUInt32LE(token & 0xffffffff, 0);
    buffer.writeUInt32LE(Math.floor(token / 0xffffffff), 4);
    buffer.writeUInt32LE(querySize, 8);
    buffer.write(encoded, 12);
    delete this.data[token];
    this.socket.write(buffer);
    this.runningQueries.push(token);
    this.emit('query', token);
    return token;
  }

  public readNext<T = ResponseJson>(token: number, timeout = -1): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (typeof this.data[token] !== 'undefined') {
        const data = this.data[token];
        if (typeof data !== 'function') {
          delete this.data[token];
          resolve(data as any);
        }
      } else if (this.isOpen) {
        let t: NodeJS.Timer | undefined;
        if (timeout > 0) {
          t = setTimeout(
            () => reject(new RebirthdbError('Response timed out')),
            timeout
          );
        }
        this.data[token] = (data: ResponseJson) => {
          delete this.data[token];
          if (t) {
            clearTimeout(t);
          }
          resolve(data as any);
        };
      } else {
        reject(this.lastError || new RebirthdbError('Connection is closed'));
      }
    });
  }

  public close() {
    if (!this.socket) {
      return;
    }
    this.socket.removeAllListeners();
    this.socket.destroy();
    this.socket = undefined;
    this.isOpen = false;
    this.mode = 'handshake';
    this.removeAllListeners();
  }

  private async performHandshake() {
    if (!this.socket || this.status !== 'handshake') {
      throw new RebirthdbError('Connection is not open');
    }
    const { randomString, authBuffer } = buildAuthBuffer(this.user);
    this.socket.write(authBuffer);
    validateVersion(await this.readNext<any>(0));
    const { authentication } = await this.readNext<any>(1);
    const { serverSignature, proof } = await computeSaltedPassword(
      authentication,
      randomString,
      this.user,
      this.password
    );
    this.socket.write(proof);
    const { authentication: returnedSignature } = await this.readNext<any>(2);
    compareDigest(returnedSignature, serverSignature);
    this.mode = 'response';
  }

  private handleHandshakeData() {
    let index: number = -1;
    while ((index = this.buffer.indexOf(0)) >= 0) {
      const strMsg = this.buffer.slice(0, index).toString('utf8');
      try {
        const jsonMsg = JSON.parse(strMsg);
        if (jsonMsg.success) {
          const token = this.nextToken++;
          if (typeof this.data[token] === 'function') {
            (this.data[token] as any)(jsonMsg as any);
            delete this.data[token];
          } else {
            this.data[token] = jsonMsg;
          }
        } else {
          this.handleError(
            new RebirthdbError(jsonMsg.error, jsonMsg.error_code)
          );
        }
      } catch {
        this.handleError(new RebirthdbError(strMsg));
      }
      this.buffer = this.buffer.slice(index + 1);
      index = this.buffer.indexOf(0);
    }
  }

  private handleData() {
    while (this.buffer.length >= 12) {
      const token =
        this.buffer.readUInt32LE(0) + 0x100000000 * this.buffer.readUInt32LE(4);
      const responseLength = this.buffer.readUInt32LE(8);

      if (this.buffer.length < 12 + responseLength) {
        break;
      }

      const responseBuffer = this.buffer.slice(12, 12 + responseLength);
      const response: ResponseJson = JSON.parse(
        responseBuffer.toString('utf8')
      );

      if (typeof this.data[token] === 'function') {
        (this.data[token] as any)(response);
        delete this.data[token];
      } else {
        this.data[token] = response;
      }
      this.buffer = this.buffer.slice(12 + responseLength);
      if (response.t !== Response.ResponseType.SUCCESS_PARTIAL) {
        const tokenIndex = this.runningQueries.indexOf(token);
        if (tokenIndex >= 0) {
          this.runningQueries.splice(tokenIndex, 1);
          this.emit('release', this.runningQueries.length);
        }
      }
      this.emit('data', response, token);
    }
  }

  private handleError(err: Error) {
    this.close();
    this.lastError = err;
    this.emit('error', err);
  }
}
