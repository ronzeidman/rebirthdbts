import { EventEmitter } from 'events';
import { promisify } from 'util';
import { Cursor } from './cursor';
import { RebirthdbError } from './error';
import { NULL_BUFFER } from './handshake';
import { TermJson } from './internal-types';
import { Query, Response, Term } from './proto/ql2';
import { RebirthDBSocket } from './socket';
import { Connection, RunOptions, ServerInfo } from './types';

export class RebirthDBConnection extends EventEmitter implements Connection {
  public clientPort: number;
  public clientAddress: string;
  private socket: RebirthDBSocket;
  private timeout: number;
  private pingInterval: number;
  private silent: boolean;
  private log: (message: string) => any;
  private pingTimer?: NodeJS.Timer;
  private db = 'test';

  constructor(
    { host = 'localhost', port = 28015 } = {},
    {
      db = 'test',
      user = 'admin',
      password = '',
      timeout = 20,
      pingInterval = -1,
      silent = false,
      log = (message: string) => undefined
    } = {}
  ) {
    super();
    this.clientPort = port;
    this.clientAddress = host;
    this.timeout = timeout;
    this.pingInterval = pingInterval;
    this.silent = silent;
    this.log = log;
    this.use(db);

    this.socket = new RebirthDBSocket({
      port,
      host,
      user,
      password: password
        ? Buffer.concat([new Buffer(password), NULL_BUFFER])
        : NULL_BUFFER
    });
  }

  public getSocket() {
    return this.socket;
  }

  public async close({ noreplyWait = false } = {}): Promise<void> {
    try {
      this.stopPinging();
      if (noreplyWait) {
        await this.noreplyWait();
      }
      this.socket.close();
    } catch (err) {
      this.socket.close();
      throw err;
    }
  }
  public async reconnect(
    options?: { noreplyWait: boolean },
    { host = this.clientAddress, port = this.clientPort } = {}
  ): Promise<void> {
    this.clientPort = port;
    this.clientAddress = host;
    if (this.socket.status === 'open' || this.socket.status === 'handshake') {
      await this.close(options);
    }
    this.socket
      .on('connect', () => this.emit('connect'))
      .on('close', () => this.emit('close'))
      .on('error', err => this.reportError(err))
      .on('data', (data, token) => this.emit(data, token))
      .on('release', count => {
        if (count === 0) {
          this.emit('release');
        }
      });
    await Promise.race([
      promisify(setTimeout)(this.timeout * 1000),
      this.socket.connect({}, { host, port })
    ]);
    if (this.socket.status === 'errored') {
      this.reportError(this.socket.lastError as any);
      this.emit('close');
      this.close();
      throw this.socket.lastError;
    }
    if (this.socket.status !== 'open') {
      this.emit('timeout');
      this.emit('close');
      this.close();
      throw new RebirthdbError('Connection timed out');
    }
    this.startPinging();
  }
  public use(db: string): void {
    this.db = db;
  }
  public async noreplyWait(): Promise<void> {
    const token = this.socket.sendQuery([Query.QueryType.NOREPLY_WAIT]);
    const result = await this.socket.readNext(token);
    if (result.t !== Response.ResponseType.WAIT_COMPLETE) {
      if (this.socket.status === 'errored') {
        throw this.socket.lastError;
      }
      const err = new RebirthdbError('Unexpected return value');
      this.reportError(err);
      throw err;
    }
  }
  public async server(): Promise<ServerInfo> {
    const token = this.socket.sendQuery([Query.QueryType.SERVER_INFO]);
    const result = await this.socket.readNext(token);
    if (result.t !== Response.ResponseType.SERVER_INFO) {
      if (this.socket.status === 'errored') {
        throw this.socket.lastError;
      }
      const err = new RebirthdbError('Unexpected return value');
      this.reportError(err);
      throw err;
    }
    return result.r[0];
  }
  public async query(term: TermJson, globalArgs: RunOptions = {}) {
    const token = this.socket.sendQuery([
      Query.QueryType.START,
      term,
      { db: this.db, ...globalArgs }
    ]);
    const cursor = new Cursor(this.socket, token, globalArgs);
    if (globalArgs.immidiateReturn) {
      return cursor;
    }
    const type = await cursor.resolve();
    if (type === Response.ResponseType.SUCCESS_ATOM) {
      return await cursor.next();
    }
    return cursor;
  }

  private startPinging() {
    if (this.pingInterval > 0) {
      this.pingTimer = setTimeout(async () => {
        const token = this.socket.sendQuery([
          Query.QueryType.START,
          [Term.TermType.ERROR, ['ping']]
        ]);
        const result = await this.socket.readNext(token, 5000);
        if (
          result.t !== Response.ResponseType.RUNTIME_ERROR ||
          result.e !== Response.ErrorType.USER ||
          result.r[0] !== 'ping'
        ) {
          this.reportError(new RebirthdbError('Ping error'));
        }
        if (this.pingTimer) {
          this.startPinging();
        }
      }, this.pingInterval);
    }
  }

  private stopPinging() {
    if (this.pingTimer) {
      clearTimeout(this.pingTimer);
    }
    this.pingTimer = undefined;
  }

  private reportError(err: Error) {
    this.emit('error', err);
    this.log(err.toString());
    if (!this.silent) {
      console.error(err.toString());
    }
  }
}
