import { Socket, SocketConnectOpts } from 'net';
import { RebirthdbError } from './error';
import {
  NULL_BUFFER,
  buildAuthBuffer,
  compareDigest,
  computeSaltedPassword,
  validateVersion
} from './handshake';
import { QueryJson, TermJson } from './internal-types';
import { Query } from './proto/ql2';
import { RunOptions } from './types';

export class RebirthDBSocket {
  public readonly port: number;
  public readonly host: string;
  public readonly user: string;
  public readonly password: Buffer;
  private socket: Socket;
  private nextToken = 0;
  private buffer = new Buffer(0);
  private isOpen = false;
  private mode: 'handshake' | 'response' = 'handshake';
  private data: any[] = [];
  private lastError?: Error;

  constructor({
    port = 28015,
    host = 'localhost',
    user = 'admin',
    password = NULL_BUFFER
  } = {}) {
    this.port = port;
    this.host = host;
    this.user = user;
    this.password = password;
    this.socket = new Socket()
      .on('close', () => (this.isOpen = false))
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
  }

  public async connect(options: Partial<SocketConnectOpts> = {}) {
    await new Promise(resolve =>
      this.socket.connect(
        { port: this.port, host: this.host, ...options },
        resolve
      )
    );
    this.isOpen = true;
    await this.performHandshake();
  }

  public async query(term: TermJson, optargs?: RunOptions) {
    const query: QueryJson = [Query.QueryType.START, term];
    if (optargs) {
      query[2] = optargs;
    }
    const encoded = JSON.stringify(query);
    const querySize = Buffer.byteLength(encoded);
    const buffer = new Buffer(8 + 4 + querySize);
    const token = this.nextToken++;
    // tslint:disable-next-line:no-bitwise
    buffer.writeUInt32LE(token & 0xffffffff, 0);
    buffer.writeUInt32LE(Math.floor(token / 0xffffffff), 4);
    buffer.writeUInt32LE(querySize, 8);
    buffer.write(encoded, 12);
    this.socket.write(buffer);
    return this.readNext(token);
  }

  public close() {
    this.socket.destroy();
  }

  private async performHandshake() {
    const { randomString, authBuffer } = buildAuthBuffer(this.user);
    this.socket.write(authBuffer);
    validateVersion(await this.readNext(0));
    const { authentication } = await this.readNext(1);
    const { serverSignature, proof } = await computeSaltedPassword(
      authentication,
      randomString,
      this.user,
      this.password
    );
    this.socket.write(proof);
    const { authentication: returnedSignature } = await this.readNext(2);
    compareDigest(returnedSignature, serverSignature);
    this.mode = 'response';
  }

  private readNext(token: number, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof this.data[token] !== 'undefined') {
        const data = this.data[token];
        delete this.data[token];
        resolve(data);
      } else if (this.isOpen) {
        const t = setTimeout(
          () => reject(new RebirthdbError('Response timed out')),
          timeout
        );
        this.data[token] = (data: any) => {
          clearTimeout(t);
          resolve(data);
        };
      } else {
        reject(this.lastError || new RebirthdbError('Connection is closed'));
      }
    });
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
            this.data[token](jsonMsg);
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
      const response = JSON.parse(responseBuffer.toString('utf8'));

      if (typeof this.data[token] === 'function') {
        this.data[token](response);
        delete this.data[token];
      } else {
        this.data[token] = response;
      }

      this.buffer = this.buffer.slice(12 + responseLength);
    }
  }

  private handleError(err: Error) {
    this.socket.destroy();
    this.isOpen = false;
    this.lastError = err;
  }
}
