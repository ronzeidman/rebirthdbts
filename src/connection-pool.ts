import { EventEmitter } from 'events';
import { inspect, promisify } from 'util';
import { RebirthdbError } from './error';
import { NULL_BUFFER } from './handshake';
import { TermJson } from './internal-types';
import { Query, Response, Term } from './proto/ql2';
import { RebirthDBSocket } from './socket';
import { Connection, ServerInfo } from './types';

export class RebirthDBConnection extends EventEmitter implements Connection {
  public readonly clientPort: number;
  public readonly clientAddress: string;
  private socket: RebirthDBSocket;
  private timeout: number;
  private pingInterval: number;
  private silent: boolean;
  private log: () => void;
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
      log = () => undefined
    } = {}
  ) {
    super();
    this.clientPort = port;
    this.clientAddress = host;
    this.socket = new RebirthDBSocket({
      port,
      host,
      user,
      password: password
        ? Buffer.concat([new Buffer(password), NULL_BUFFER])
        : NULL_BUFFER
    });
    this.timeout = timeout;
    this.pingInterval = pingInterval;
    this.silent = silent;
    this.log = log;
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
    options?: { noreplyWait: true } | undefined
  ): Promise<void> {
    if (this.socket.status === 'open' || this.socket.status === 'handshake') {
      await this.close(options);
    }
    await Promise.race([
      promisify(setTimeout)(this.timeout * 1000),
      this.socket.connect()
    ]);
    if (this.socket.status === 'errored') {
      throw this.socket.lastError;
    }
    if (this.socket.status !== 'open') {
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
      throw new RebirthdbError('Unexpected return value');
    }
  }
  public async server(): Promise<ServerInfo> {
    const token = this.socket.sendQuery([Query.QueryType.SERVER_INFO]);
    const result = await this.socket.readNext(token);
    if (result.t !== Response.ResponseType.SERVER_INFO) {
      if (this.socket.status === 'errored') {
        throw this.socket.lastError;
      }
      throw new RebirthdbError('Unexpected return value');
    }
    return result.r[0];
  }
  public async query(term: TermJson, globalArgs: any = {}) {
    const token = this.socket.sendQuery([
      Query.QueryType.START,
      term,
      { db: this.db, ...globalArgs }
    ]);
    const result = await this.socket.readNext(token);
    console.log(inspect(result));
    switch (result.t) {
      case Response.ResponseType.CLIENT_ERROR:
      case Response.ResponseType.COMPILE_ERROR:
      case Response.ResponseType.RUNTIME_ERROR:
        throw new RebirthdbError('Query error');
      case Response.ResponseType.SUCCESS_ATOM:
        return result.r[0];
      case Response.ResponseType.SUCCESS_PARTIAL:
      case Response.ResponseType.SUCCESS_SEQUENCE:
        return result.r;
      default:
        throw new RebirthdbError('Unexpected return value');
    }
  }

  private startPinging() {
    if (this.pingInterval > 0) {
      this.pingTimer = setTimeout(async () => {
        const token = this.socket.sendQuery([
          Query.QueryType.START,
          [Term.TermType.ERROR, ['ping']]
        ]);
        const result = await this.socket.readNext(token);
        if (
          result.t !== Response.ResponseType.RUNTIME_ERROR ||
          result.e !== Response.ErrorType.USER ||
          result.r[0] !== 'ping'
        ) {
          console.error('Ping error!');
          console.error(inspect(result));
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
}
