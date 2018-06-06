import { EventEmitter } from 'events';
import { Socket, TcpNetConnectOpts, connect as netConnect } from 'net';
import { connect as tlsConnect } from 'tls';
import { isError, isUndefined } from 'util';
import { RServerConnectionOptions, RebirthDBErrorType } from '..';
import { RebirthDBError, isRebirthDBError } from '../error/error';
import { QueryJson, ResponseJson } from '../internal-types';
import { QueryType, ResponseType } from '../proto/enums';
import {
  NULL_BUFFER,
  buildAuthBuffer,
  compareDigest,
  computeSaltedPassword,
  validateVersion
} from './handshake-utils';

export type RNConnOpts = RServerConnectionOptions & {
  host: string;
  port: number;
};

export class RebirthDBSocket extends EventEmitter {
  public connectionOptions: RNConnOpts;
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
  public socket?: Socket;
  private isOpen = false;
  private nextToken = 0;
  private buffer = new Buffer(0);
  private mode: 'handshake' | 'response' = 'handshake';
  private data: Array<
    Error | ResponseJson | ((arg: ResponseJson) => void)
  > = [];
  private ca?: Buffer[];

  constructor({
    connectionOptions,
    user = 'admin',
    password = NULL_BUFFER
  }: {
    connectionOptions: RNConnOpts;
    user?: string;
    password?: Buffer;
  }) {
    super();
    this.connectionOptions = setConnectionDefaults(connectionOptions);
    this.user = user;
    this.password = password;
  }

  public eventNames() {
    return ['connect', 'query', 'data', 'release', 'error'];
  }

  public async connect() {
    if (this.socket) {
      throw new RebirthDBError('Socket already connected', {
        type: RebirthDBErrorType.CONNECTION
      });
    }
    const { tls = false, ...options } = this.connectionOptions;
    let socket: Socket = (undefined as any) as Socket;
    try {
      await new Promise((resolve, reject) => {
        socket = tls
          ? tlsConnect(options)
              .once('connect', resolve)
              .once('error', reject)
          : netConnect(options as TcpNetConnectOpts)
              .once('connect', resolve)
              .once('error', reject);
      });
    } catch (err) {
      this.handleError(err);
    }
    socket.removeAllListeners();
    socket
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
    socket.setKeepAlive(true);
    this.socket = socket;
    await new Promise((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('error', reject);
      if (socket.destroyed) {
        socket.removeListener('connect', resolve);
        socket.removeListener('error', reject);
        reject(this.lastError);
      } else if (!socket.connecting) {
        socket.removeListener('connect', resolve);
        socket.removeListener('error', reject);
        resolve();
      }
    });
    this.isOpen = true;
    await this.performHandshake();
    this.emit('connect');
  }

  public sendQuery(query: QueryJson, token = this.nextToken++) {
    if (!this.socket || this.status !== 'open') {
      throw new RebirthDBError(
        '`run` was called with a closed connection after:',
        { query, type: RebirthDBErrorType.CONNECTION }
      );
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
    const optargs = query[2] || {};
    if (optargs.noreply || this.startQuery(token)) {
      this.emit('query', token);
    }
    return token;
  }

  public stopQuery(token: number) {
    if (this.runningQueries.includes(token)) {
      this.sendQuery([QueryType.STOP], token);
    }
    this.setData(token);
    this.finishQuery(token);
  }

  public readNext<T = ResponseJson>(
    token: number,
    timeout = -1,
    query?: QueryJson
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.status === 'open' && !this.runningQueries.includes(token)) {
        reject(new RebirthDBError('Query is not running', { query }));
      }
      if (!isUndefined(this.data[token])) {
        const data = this.data[token];
        if (isError(data)) {
          reject(data);
        } else if (typeof data !== 'function') {
          delete this.data[token];
          resolve(data as any);
        }
      } else if (this.isOpen) {
        let t: NodeJS.Timer | undefined;
        if (timeout > 0) {
          t = setTimeout(
            () =>
              reject(
                new RebirthDBError('Response timed out', {
                  query,
                  type: RebirthDBErrorType.TIMEOUT
                })
              ),
            timeout
          );
        }
        this.data[token] = (data: ResponseJson) => {
          delete this.data[token];
          if (t) {
            clearTimeout(t);
          }
          if (data && !isError(data)) {
            resolve(data as any);
          } else if (isRebirthDBError(data)) {
            data.addBacktrace({ query });
            reject(data);
          } else if (isError(data)) {
            reject(data);
          } else {
            reject(
              new RebirthDBError('Query cancelled', {
                query,
                type: RebirthDBErrorType.CANCEL
              })
            );
          }
        };
      } else {
        reject(
          this.lastError ||
            new RebirthDBError('Connection is closed', {
              query,
              type: RebirthDBErrorType.CONNECTION
            })
        );
      }
    });
  }

  public close() {
    for (const key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        this.setData(
          +key,
          new RebirthDBError(
            'The connection was closed before the query could be completed.',
            { type: RebirthDBErrorType.CONNECTION }
          )
        );
      }
    }
    if (!this.socket) {
      return;
    }
    this.socket.removeAllListeners();
    this.socket.destroy();
    this.socket = undefined;
    this.isOpen = false;
    this.mode = 'handshake';
    this.removeAllListeners();
    this.nextToken = 0;
  }

  private async performHandshake() {
    if (!this.socket || this.status !== 'handshake') {
      throw new RebirthDBError('Connection is not open', {
        type: RebirthDBErrorType.CONNECTION
      });
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
            new RebirthDBError(jsonMsg.error, { errorCode: jsonMsg.error_code })
          );
        }
      } catch {
        this.handleError(
          new RebirthDBError(strMsg, { type: RebirthDBErrorType.AUTH })
        );
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

      this.setData(token, response);
      this.buffer = this.buffer.slice(12 + responseLength);
      if (response.t !== ResponseType.SUCCESS_PARTIAL) {
        this.finishQuery(token);
      }
      this.emit('data', response, token);
    }
  }

  private startQuery(token: number) {
    if (!this.runningQueries.includes(token)) {
      this.runningQueries.push(token);
      return true;
    }
    return false;
  }

  private finishQuery(token: number) {
    const tokenIndex = this.runningQueries.indexOf(token);
    if (tokenIndex >= 0) {
      this.runningQueries.splice(tokenIndex, 1);
      this.emit('release', this.runningQueries.length);
    }
  }

  private setData(token: number, response?: ResponseJson | Error) {
    if (typeof this.data[token] === 'function') {
      (this.data[token] as any)(response);
      delete this.data[token];
    } else if (!response) {
      delete this.data[token];
    } else {
      this.data[token] = response;
    }
  }

  private handleError(err: Error) {
    this.close();
    this.lastError = err;
    if (this.listenerCount('error') > 0) {
      this.emit('error', err);
    }
  }
}

export function setConnectionDefaults(
  connectionOptions: RServerConnectionOptions
): RNConnOpts {
  connectionOptions.host = connectionOptions.host || 'localhost';
  connectionOptions.port = connectionOptions.port || 28015;
  return connectionOptions as any;
}
