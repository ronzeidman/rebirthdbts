import { EventEmitter } from 'events';
import { isIPv6 } from 'net';
import { promisify } from 'util';
import { RebirthDBError } from '../error/error';
import { TermJson } from '../internal-types';
import { r } from '../query-builder/r';
import {
  Changes,
  ConnectionOptions,
  MasterPool,
  RCursor,
  RServer,
  RunOptions
} from '../types';
import { ServerConnectionPool } from './server-pool';

export class MasterConnectionPool extends EventEmitter implements MasterPool {
  private healthy: boolean | undefined = undefined;
  private buffer: number;
  private max: number;
  private timeoutError: number;
  private timeoutGb: number;
  private maxExponent: number;
  private silent: boolean;
  private discovery: boolean;
  private discoveryCursor?: RCursor<Changes<ServerStatus>>;
  private log: (message: string) => any;
  private servers: RServer[];
  private serverPools: ServerConnectionPool[];

  private connParam: any;

  private timers = new Map<ServerConnectionPool, NodeJS.Timer>();

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
    // min one per server but wont redistribute conn from failed servers
    this.buffer = Math.max(buffer, 1);
    this.max = Math.max(max, buffer);
    this.timeoutError = timeoutError;
    this.timeoutGb = timeoutGb;
    this.maxExponent = maxExponent;
    this.silent = silent;
    this.log = log;
    this.discovery = discovery;
    this.connParam = { db, user, password, timeout, pingInterval, silent, log };
    this.servers = servers.map(server => ({
      host: server.host || 'localhost',
      port: server.port || 28015
    }));
    this.serverPools = [];
  }

  public async initServers(serverNum = 0): Promise<void> {
    if (serverNum < this.servers.length) {
      return this.createServerPool(this.servers[serverNum]).then(() =>
        this.initServers(serverNum + 1)
      );
    } else {
      this.rebalanceServerPools();
    }
  }

  public get isHealthy() {
    return this.serverPools.some(pool => pool.isHealthy);
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
    this.buffer = buffer;
    this.max = max;
    this.rebalanceServerPools();
  }

  public async drain({ noreplyWait = false } = {}) {
    this.emit('draining');
    this.discovery = false;
    await Promise.all(
      this.serverPools.map(pool => {
        pool.removeAllListeners();
        return pool.drain({ noreplyWait });
      })
    );
  }

  public getPools() {
    return this.serverPools;
  }

  public getConnections() {
    return this.serverPools.map(pool => pool.getConnections()).reduce(flat, []);
  }

  public getLength() {
    return this.getOpenConnections().length;
  }

  public getAvailableLength() {
    return this.getIdleConnections().length;
  }

  public async queue(term: TermJson, globalArgs: RunOptions = {}) {
    this.emit('queueing');
    const pool = this.getPoolWithMinQueries();
    return pool.queue(term, globalArgs);
  }

  private async createServerPool(server: RServer) {
    const pool = new ServerConnectionPool(server, {
      ...this.connParam,
      buffer: 1,
      max: 1
    });
    this.serverPools = [...this.serverPools, pool];
    pool.initConnections();
    this.subscribeToPool(pool);
    return pool.waitForHealthy();
  }

  private rebalanceServerPools() {
    this.getHealthyServerPools().forEach((pool, i, all) =>
      pool.updateBufferMax({
        buffer:
          Math.floor(this.buffer / all.length) +
          (i === this.buffer % all.length ? 1 : 0),
        max:
          Math.floor(this.max / all.length) +
          (i === this.max % all.length ? 1 : 0)
      })
    );
  }

  private async discover(): Promise<void> {
    this.discoveryCursor = await r
      .db('rethinkdb')
      .table<ServerStatus>('server_status')
      .changes({ includeInitial: true, includeStates: true })
      .run();
    const newServers: RServer[] = [];
    let state: 'initializing' | 'ready' = 'initializing';
    return (
      this.discoveryCursor
        .eachAsync(async row => {
          if (row.state) {
            state = row.state;
            if (row.state === 'ready') {
              this.servers
                .filter(server => !newServers.some(s => s === server))
                .forEach(server => this.removeServer(server));
            }
          }
          if (row.new_val) {
            const server = this.getServerFromStatus(row.new_val);
            if (state === 'initializing') {
              newServers.push(server);
            }
            if (!this.servers.includes(server)) {
              this.servers.push(server);
              this.createServerPool(server).then(() =>
                this.rebalanceServerPools()
              );
            }
          } else if (row.old_val) {
            this.removeServer(this.getServerFromStatus(row.old_val));
          }
        })
        // handle disconnections
        .catch(() => promisify(setTimeout)(20 * 1000))
        .then(() => (this.discovery ? this.discover() : undefined))
    );
  }

  private getServerFromStatus(status: ServerStatus) {
    const oldServer = this.servers.find(
      server =>
        (server.host === status.network.hostname ||
          !!status.network.canonical_addresses.find(
            addr => addr.host === server.host
          )) &&
        server.port === status.network.reql_port
    );
    return (
      oldServer || {
        host: getCanonicalAddress(status.network.canonical_addresses),
        port: status.network.reql_port
      }
    );
  }

  private async removeServer(server: RServer) {
    if (this.servers.includes(server)) {
      this.servers = this.servers.filter(s => s !== server);
    }
    const pool = this.serverPools.find(
      p => server.host === p.server.host && server.port === p.server.port
    );
    if (pool) {
      await this.closeServerPool(pool);
      this.rebalanceServerPools();
    }
  }

  private subscribeToPool(pool: ServerConnectionPool) {
    const size = this.getOpenConnections().length;
    this.emit('size', size);
    if (size > 0) {
      this.setHealthy(true);
    }
    pool
      .on('size', () => {
        const size1 = this.getOpenConnections().length;
        this.emit('size', size);
      })
      .on('available-size', () =>
        this.emit('available-size', this.getAvailableLength())
      )
      .on('error', error => this.emit('error', error))
      .on('healthy', healthy =>
        this.setHealthy(!!this.getHealthyServerPools().length)
      );
  }

  private setHealthy(healthy: boolean | undefined) {
    if (typeof healthy === 'undefined') {
      this.healthy = undefined;
    } else if (healthy !== this.healthy && typeof healthy !== 'undefined') {
      this.healthy = healthy;
      this.emit('healthy', healthy);
    }
  }

  private closeServerPool(pool: ServerConnectionPool) {
    pool.removeAllListeners();
    this.serverPools = this.serverPools.filter(sp => sp !== pool);
    return pool.drain();
  }

  private getHealthyServerPools() {
    return this.serverPools.filter(pool => pool.isHealthy);
  }

  private getPoolWithMinQueries() {
    return this.getHealthyServerPools().reduce(
      (min, next) =>
        min.getNumOfRunningQueries() < next.getNumOfRunningQueries()
          ? min
          : next
    );
  }

  private getOpenConnections() {
    return this.getConnections().filter(conn => conn.isConnected);
  }

  private getIdleConnections() {
    return this.getConnections().filter(conn => !conn.numOfQueries);
  }
}

function flat(acc: any[], next: any[]) {
  return [...acc, ...next];
}

// Try to extract the most global address
// https://github.com/neumino/rethinkdbdash/blob/f77d2ffb77a8c0fa41aabc511d74aa86ea1136d9/lib/helper.js
function getCanonicalAddress(addresses: RServer[]) {
  // We suppose that the addresses are all valid, and therefore use loose regex
  return addresses
    .map(address => {
      if (
        /^127(\.\d{1,3}){3}$/.test(address.host) ||
        /0?:?0?:?0?:?0?:?0?:?0?:0?:1/.test(address.host)
      ) {
        return { address, value: 0 };
      } else if (
        isIPv6(address.host) &&
        /^[fF]|[eE]80:.*\:.*\:/.test(address.host)
      ) {
        return { address, value: 1 };
      } else if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(address.host)) {
        return { address, value: 2 };
      } else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(address.host)) {
        return { address, value: 3 };
      } else if (
        /^172\.(1\d|2\d|30|31)\.\d{1,3}\.\d{1,3}$/.test(address.host)
      ) {
        return { address, value: 4 };
      } else if (/^10(\.\d{1,3}){3}$/.test(address.host)) {
        return { address, value: 5 };
      } else if (
        isIPv6(address.host) &&
        /^[fF]|[cCdD].*\:.*\:/.test('address.host')
      ) {
        return { address, value: 6 };
      } else {
        return { address, value: 7 };
      }
    })
    .reduce((acc, next) => (acc.value > next.value ? acc : next)).address.host;
}

interface ServerStatus {
  id: string;
  name: string;
  network: {
    canonical_addresses: Array<{
      host: string;
      port: number;
    }>;
    cluster_port: number;
    connected_to: object;
    hostname: string;
    http_admin_port: number;
    reql_port: number;
    time_connected: Date;
  };
  process: {
    argv: string[];
    cache_size_mb: number;
    pid: number;
    time_started: Date;
    version: string;
  };
}
