import { EventEmitter } from 'events';
import { RebirthDBError } from '../error/error';
import { QueryJson, TermJson } from '../internal-types';
import { ErrorType, QueryType, ResponseType, TermType } from '../proto/enums';
import { parseOptarg } from '../query-builder/param-parser';
import { Cursor } from '../response/cursor';
import { Connection, RServerConnectionOptions, RunOptions, ServerInfo } from '../types';
import { NULL_BUFFER } from './handshake-utils';
import { RNConnOpts, RebirthDBSocket, setConnectionDefaults } from './socket';

const tableQueries = [
  TermType.TABLE_CREATE,
  TermType.TABLE_DROP,
  TermType.TABLE_LIST,
  TermType.TABLE
];

export class RebirthDBConnection extends EventEmitter implements Connection {
  public clientPort: number;
  public clientAddress: string;
  private options: RNConnOpts;
  private socket: RebirthDBSocket;
  private timeout: number;
  private pingInterval: number;
  private silent: boolean;
  private log: (message: string) => any;
  private pingTimer?: NodeJS.Timer;
  private db = 'test';

  constructor(
    private connectionOptions: RServerConnectionOptions,
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
    this.options = setConnectionDefaults(connectionOptions);
    this.clientPort = connectionOptions.port || 28015;
    this.clientAddress = connectionOptions.host || 'localhost';
    connectionOptions.port = this.clientPort;
    connectionOptions.host = this.clientAddress;
    this.timeout = timeout;
    this.pingInterval = pingInterval;
    this.silent = silent;
    this.log = log;
    this.use(db);

    this.socket = new RebirthDBSocket({
      connectionOptions: this.options,
      user,
      password: password
        ? Buffer.concat([new Buffer(password), NULL_BUFFER])
        : NULL_BUFFER
    });
  }

  public eventNames() {
    return ['release', 'close', 'timeout', 'error'];
  }

  public get open() {
    return this.socket.status === 'open';
  }

  public get numOfQueries() {
    return this.socket.runningQueries.length;
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

  public async reconnect(options?: { noreplyWait: boolean }) {
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
      new Promise(resolve => setTimeout(resolve, this.timeout * 1000)),
      this.socket.connect()
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
      throw new RebirthDBError(
        `Failed to connect to ${this.connectionOptions.host}:${
        this.connectionOptions.port
        } in less than ${this.timeout}s.`
      );
    }
    this.startPinging();
    return this;
  }
  public use(db: string): void {
    this.db = db;
  }
  public async noreplyWait(): Promise<void> {
    const token = this.socket.sendQuery([QueryType.NOREPLY_WAIT]);
    const result = await this.socket.readNext(token);
    if (result.t !== ResponseType.WAIT_COMPLETE) {
      if (this.socket.status === 'errored') {
        throw this.socket.lastError;
      }
      const err = new RebirthDBError('Unexpected return value');
      this.reportError(err);
      throw err;
    }
  }
  public async server(): Promise<ServerInfo> {
    const token = this.socket.sendQuery([QueryType.SERVER_INFO]);
    const result = await this.socket.readNext(token);
    if (result.t !== ResponseType.SERVER_INFO) {
      if (this.socket.status === 'errored') {
        throw this.socket.lastError;
      }
      const err = new RebirthDBError('Unexpected return value');
      this.reportError(err);
      throw err;
    }
    return result.r[0];
  }
  public async query(term: TermJson, globalArgs: RunOptions = {}) {
    const {
      timeFormat,
      groupFormat,
      binaryFormat,
      immidiateReturn,
      ...gargs
    } = globalArgs;
    gargs.db = gargs.db || this.db;
    this.findTableTermAndAddDb(term, gargs.db);
    const query: QueryJson = [QueryType.START, term, parseOptarg(gargs)];
    const token = this.socket.sendQuery(query);
    if (globalArgs.noreply) {
      return;
    }
    const cursor = new Cursor(this.socket, token, globalArgs, query);
    if (globalArgs.immidiateReturn) {
      return cursor;
    }
    const type = await cursor.resolve();
    if (type === ResponseType.SUCCESS_ATOM) {
      return await cursor.next();
    }
    return cursor;
  }

  private findTableTermAndAddDb(term: TermJson | undefined, db: any) {
    while (term) {
      if (!Array.isArray(term)) {
        return;
      }
      const termParam = term[1];
      if (tableQueries.includes(term[0])) {
        if (!termParam) {
          term[1] = [[TermType.DB, [db]]];
          return;
        }
        const innerTerm = termParam[0];
        if (Array.isArray(innerTerm) && innerTerm[0] === TermType.DB) {
          return;
        }
        termParam.unshift([TermType.DB, [db]]);
        return;
      }
      term = termParam && termParam[0];
    }
  }

  private startPinging() {
    if (this.pingInterval > 0) {
      this.pingTimer = setTimeout(async () => {
        const token = this.socket.sendQuery([
          QueryType.START,
          [TermType.ERROR, ['ping']]
        ]);
        const result = await this.socket.readNext(token, 5000);
        if (
          result.t !== ResponseType.RUNTIME_ERROR ||
          result.e !== ErrorType.USER ||
          result.r[0] !== 'ping'
        ) {
          this.reportError(new RebirthDBError('Ping error'));
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
