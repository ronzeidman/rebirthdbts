import { EventEmitter } from 'events';
import { promisify } from 'util';
import { RebirthDBError } from '../error/error';
import { TermJson } from '../internal-types';
import {
  Changes,
  ConnectionOptions,
  ConnectionPool,
  RCursor,
  RunOptions
} from '../types';
import { RebirthDBConnection } from './connection';

const REBALANCE_EVERY = 30 * 1000;

export class RebirthDBConnectionPool extends EventEmitter
  implements ConnectionPool {
  private buffer: number;
  private max: number;
  private timeoutError: number;
  private timeoutGb: number;
  private maxExponent: number;
  private silent: boolean;
  private discovery: boolean;
  private discoveryCursor?: RCursor<Changes<any>>;
  private log: (message: string) => any;
  private servers: Array<{ host: string; port: number }>;

  private connParam: any;

  private connections: RebirthDBConnection[] = [];
  private timers = new Map<RebirthDBConnection, NodeJS.Timer>();
  private nextServerConn = 0;

  constructor({
    db = 'test',
    user = 'admin',
    password = '',
    discovery = false,
    servers = [{ host: 'localhost', port: 28015 }],
    buffer = servers.length,
    max = servers.length,
    timeout = 20,
    pingInterval = -1,
    timeoutError = 1000,
    timeoutGb = 60 * 60 * 1000,
    maxExponent = 6,
    silent = false,
    log = (message: string) => undefined
  }: ConnectionOptions = {}) {
    super();
    this.buffer = buffer;
    this.max = max;
    this.timeoutError = timeoutError;
    this.timeoutGb = timeoutGb;
    this.maxExponent = maxExponent;
    this.silent = silent;
    this.log = log;
    this.servers = servers.map(({ host, port }) => ({
      host,
      port: port || 28015
    }));
    this.discovery = discovery;
    this.connParam = { db, user, password, timeout, pingInterval, silent, log };
    this.connections = Array(buffer)
      .fill(0)
      .map(() => this.createConnection());
  }

  public waitForHealthy() {
    return new Promise((resolve, reject) => {
      if (this.getLength() > 0) {
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
    }).then(() => (this.discovery ? this.initDiscovery() : undefined));
  }

  public async drain({ noreplyWait = false } = {}) {
    this.emit('draining');
    this.servers = [];
    await Promise.all(
      this.connections.map(conn => {
        conn.removeAllListeners();
        return conn.close({ noreplyWait });
      })
    );
  }

  public getLength() {
    return this.getOpenConnections().length;
  }

  public getAvailableLength() {
    return this.getIdleConnections().length;
  }

  public getPools() {
    return this.connections;
  }

  public async queue(term: TermJson, globalArgs: RunOptions = {}) {
    this.emit('queueing');
    const idleConnections = this.getIdleConnections();
    if (!idleConnections.length) {
      if (this.connections.length < this.max) {
        const conn = this.createConnection();
        return conn.query(term, globalArgs);
      }
      const openConnections = this.getOpenConnections();
      if (!openConnections.length) {
        throw this.reportError(new RebirthDBError('No connections available'));
      }
      return openConnections.reduce(minQueriesRunning).query(term, globalArgs);
    }
    return idleConnections[0].query(term, globalArgs);
  }

  private createConnection() {
    const conn = new RebirthDBConnection(this.servers[0], this.connParam);
    this.persistConnection(conn);
    this.connections = [...this.connections, conn];
    return conn;
  }

  private subscribeToConnection(conn: RebirthDBConnection) {
    if (conn.getSocket().status === 'open') {
      const size = this.getOpenConnections().length;
      this.emit('size', size);
      if (size > 0) {
        this.emit('healthy', true);
      }
      this.checkIdle(conn);
      conn
        .on('close', () => {
          const size1 = this.getOpenConnections().length;
          this.emit('size', size1);
          if (size === 0) {
            this.emit('healthy', false);
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
    this.emit('size', this.connections.length);
  }

  private checkIdle(conn: RebirthDBConnection) {
    if (!conn.getSocket().runningQueries.length) {
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
    while (this.servers.length > 0 && conn.getSocket().status !== 'open') {
      try {
        await conn.reconnect(
          { noreplyWait: false },
          this.servers[this.nextServerConn]
        );
      } catch (err) {
        this.reportError(err);
        await promisify(setTimeout)(2 ** exp * this.timeoutError);
        exp = Math.min(exp + 1, this.maxExponent);
      }
      this.nextServerConn = (this.nextServerConn + 1) % this.servers.length;
    }
    if (!this.servers.length) {
      await conn.close();
      return;
    }
    this.subscribeToConnection(conn);
  }

  private async initDiscovery() {
    // this.discoveryCursor = await r
    //   .db('rethinkdb')
    //   .table('server_status')
    //   .changes({ includeInitial: true })
    //   .run();
    // return this.discoveryCursor.eachAsync(server => {
    // })
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
    return this.connections.filter(conn => conn.getSocket().status === 'open');
  }

  private getIdleConnections() {
    return this.getOpenConnections().filter(
      conn => !conn.getSocket().runningQueries.length
    );
  }
}

function minQueriesRunning(
  acc: RebirthDBConnection,
  next: RebirthDBConnection
) {
  return acc.getSocket().runningQueries <= next.getSocket().runningQueries
    ? acc
    : next;
}
