import { EventEmitter } from 'events';
import { RebirthDBError } from '../error/error';
import { TermJson } from '../internal-types';
import { ConnectionPool, RConnectionOptions, RServerConnectionOptions, RunOptions } from '../types';
import { RebirthDBConnection } from './connection';
import { RNConnOpts, setConnectionDefaults } from './socket';

const REBALANCE_EVERY = 30 * 1000;

export class ServerConnectionPool extends EventEmitter
  implements ConnectionPool {
  public readonly server: RNConnOpts;
  private healthy: boolean | undefined = undefined;
  private buffer: number;
  private max: number;
  private timeoutError: number;
  private timeoutGb: number;
  private maxExponent: number;
  private silent: boolean;
  private log: (message: string) => any;

  private connParam: any;

  private connections: RebirthDBConnection[] = [];
  private timers = new Map<RebirthDBConnection, NodeJS.Timer>();

  constructor(
    connectionOptions: RServerConnectionOptions,
    {
      db = 'test',
      user = 'admin',
      password = '',
      buffer = 1,
      max = 1,
      timeout = 20,
      pingInterval = -1,
      timeoutError = 1000,
      timeoutGb = 60 * 60 * 1000,
      maxExponent = 6,
      silent = false,
      log = (message: string) => undefined
    }: RConnectionOptions = {}
  ) {
    super();
    this.buffer = Math.max(buffer, 1);
    this.max = Math.max(max, buffer);
    this.timeoutError = timeoutError;
    this.timeoutGb = timeoutGb;
    this.maxExponent = maxExponent;
    this.silent = silent;
    this.log = log;
    this.server = setConnectionDefaults(connectionOptions);
    this.connParam = { db, user, password, timeout, pingInterval, silent, log };
    this.connections = [];
  }

  public eventNames() {
    return ['draining', 'queueing', 'size', 'available-size', 'healthy', 'error'];
  }

  public async initConnections(): Promise<void> {
    if (this.connections.length < this.buffer) {
      return this.createConnection().then(() => this.initConnections());
    }
  }

  public get isHealthy() {
    return this.connections.some(conn => conn.open);
  }

  public waitForHealthy() {
    return new Promise((resolve, reject) => {
      if (this.isHealthy) {
        resolve();
      } else {
        this.once('healthy', healthy => {
          if (healthy) {
            resolve();
          } else {
            reject(new RebirthDBError('Error initializing pool'));
          }
        });
      }
    });
  }

  public updateBufferMax({ buffer, max }: { buffer: number; max: number }) {
    if (this.buffer > buffer && this.connections.length < buffer) {
      this.buffer = buffer;
      this.initConnections();
    } else {
      this.connections.forEach(conn => this.checkIdle(conn));
    }
    if (this.max > max) {
      const connections = this.getIdleConnections();
      for (let i = 0; i < this.max - max; i++) {
        const conn = connections.pop();
        if (!conn) {
          break;
        }
        this.closeConnection(conn);
      }
    }
    this.max = max;
  }

  public async drain({ noreplyWait = false } = {}, emit = true) {
    if (emit) {
      this.emit('draining');
      this.setHealthy(undefined);
    }
    await Promise.all(
      this.connections.map(conn => {
        conn.removeAllListeners();
        return conn.close({ noreplyWait });
      })
    );
  }

  public getConnections() {
    return this.connections;
  }

  public getLength() {
    return this.getOpenConnections().length;
  }

  public getAvailableLength() {
    return this.getIdleConnections().length;
  }

  public getNumOfRunningQueries() {
    return this.getOpenConnections().reduce(
      (num, next) => next.numOfQueries + num,
      0
    );
  }

  public async queue(term: TermJson, globalArgs: RunOptions = {}) {
    this.emit('queueing');
    const idleConnections = this.getIdleConnections();
    if (!idleConnections.length) {
      if (
        this.connections.length < this.max &&
        this.connections.length > this.buffer
      ) {
        const conn = await this.createConnection();
        if (conn) {
          // if couldnt go above buffer try using an open connection instead of waiting for timeout and reconnect
          return conn.query(term, globalArgs);
        }
      }
      const openConnections = this.getOpenConnections();
      if (!openConnections.length) {
        throw this.reportError(new RebirthDBError('No connections available'));
      }
      return openConnections.reduce(minQueriesRunning).query(term, globalArgs);
    }
    return idleConnections[0].query(term, globalArgs);
  }

  private setHealthy(healthy: boolean | undefined) {
    if (typeof healthy === 'undefined') {
      this.healthy = undefined;
    } else if (healthy !== this.healthy && typeof healthy !== 'undefined') {
      this.healthy = healthy;
      this.emit('healthy', healthy);
    }
  }

  private async createConnection() {
    const conn = new RebirthDBConnection(this.server, this.connParam);
    this.connections = [...this.connections, conn];
    return await this.persistConnection(conn);
  }

  private subscribeToConnection(conn: RebirthDBConnection) {
    if (conn.open) {
      const size = this.getOpenConnections().length;
      this.emit('size', size);
      this.setHealthy(true);
      this.checkIdle(conn);
      conn
        .on('close', () => {
          const size1 = this.getOpenConnections().length;
          this.emit('size', size1);
          if (size === 0) {
            this.setHealthy(false);
            // if no connections are available need to remove all connections and start over
            // so it won't try to reconnect all connections at once
            this.drain({}, false).then(() => this.initConnections());
          }
          conn.removeAllListeners();
          this.persistConnection(conn);
        })
        .on('data', () => this.checkIdle(conn))
        .on('query', () => this.checkIdle(conn));
    }
  }

  private closeConnection(conn: RebirthDBConnection) {
    this.removeIdleTimer(conn);
    conn.removeAllListeners();
    conn.close();
    this.connections = this.connections.filter(c => c !== conn);
    this.emit('size', this.getOpenConnections().length);
  }

  private checkIdle(conn: RebirthDBConnection) {
    if (!conn.numOfQueries) {
      this.emit('available-size', this.getIdleConnections().length);
      this.timers.set(
        conn,
        setTimeout(() => {
          this.timers.delete(conn);
          if (this.connections.length > this.buffer) {
            this.closeConnection(conn);
            this.emit('available-size', this.getIdleConnections().length);
          }
        }, this.timeoutGb)
      );
    } else {
      this.removeIdleTimer(conn);
    }
  }

  private removeIdleTimer(conn: RebirthDBConnection) {
    const timer = this.timers.get(conn);
    if (timer) {
      clearTimeout(timer);
    }
    this.timers.delete(conn);
  }

  private async persistConnection(conn: RebirthDBConnection) {
    let exp = 0;
    while (this.connections.includes(conn) && !conn.open) {
      try {
        await conn.reconnect();
      } catch (err) {
        this.reportError(err);
        if (this.connections.length > this.buffer) {
          // if trying to go above buffer and failing just use one of the open connections
          this.closeConnection(conn);
          break;
        }
        if (typeof this.healthy === 'undefined') {
          this.setHealthy(false);
        }
        await new Promise(resolve =>
          setTimeout(resolve, 2 ** exp * this.timeoutError)
        );
        exp = Math.min(exp + 1, this.maxExponent);
      }
    }
    if (!this.connections.includes(conn)) {
      // draining/removing
      await conn.close();
      return;
    }
    this.subscribeToConnection(conn);
    return conn;
  }

  private reportError(err: Error) {
    this.emit('error', err);
    this.log(err.toString());
    if (!this.silent) {
      console.error(err.toString());
    }
    return err;
  }

  private getOpenConnections() {
    return this.connections.filter(conn => conn.open);
  }

  private getIdleConnections() {
    return this.getOpenConnections().filter(conn => !conn.numOfQueries);
  }
}

function minQueriesRunning(
  acc: RebirthDBConnection,
  next: RebirthDBConnection
) {
  return acc.numOfQueries <= next.numOfQueries ? acc : next;
}
