"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const net_1 = require("net");
const util_1 = require("util");
const error_1 = require("../error/error");
const r_1 = require("../query-builder/r");
const server_pool_1 = require("./server-pool");
class MasterConnectionPool extends events_1.EventEmitter {
    constructor({ db = 'test', user = 'admin', password = '', discovery = false, servers = [{ host: 'localhost', port: 28015 }], buffer = servers.length, max = servers.length, timeout = 20, pingInterval = -1, timeoutError = 1000, timeoutGb = 60 * 60 * 1000, maxExponent = 6, silent = false, log = (message) => undefined } = {}) {
        super();
        this.healthy = undefined;
        this.timers = new Map();
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
    async initServers(serverNum = 0) {
        if (serverNum < this.servers.length) {
            return this.createServerPool(this.servers[serverNum]).then(() => this.initServers(serverNum + 1));
        }
        else {
            this.rebalanceServerPools();
        }
    }
    get isHealthy() {
        return this.serverPools.some(pool => pool.isHealthy);
    }
    waitForHealthy() {
        return new Promise((resolve, reject) => {
            if (this.isHealthy) {
                resolve();
            }
            else {
                this.once('healthy', healthy => {
                    if (healthy) {
                        resolve();
                    }
                    else {
                        reject(new error_1.RebirthDBError('Error initializing pool'));
                    }
                });
            }
        });
    }
    updateBufferMax({ buffer, max }) {
        this.buffer = buffer;
        this.max = max;
        this.rebalanceServerPools();
    }
    async drain({ noreplyWait = false } = {}) {
        this.emit('draining');
        this.discovery = false;
        await Promise.all(this.serverPools.map(pool => {
            pool.removeAllListeners();
            return pool.drain({ noreplyWait });
        }));
    }
    getPools() {
        return this.serverPools;
    }
    getConnections() {
        return this.serverPools.map(pool => pool.getConnections()).reduce(flat, []);
    }
    getLength() {
        return this.getOpenConnections().length;
    }
    getAvailableLength() {
        return this.getIdleConnections().length;
    }
    async queue(term, globalArgs = {}) {
        this.emit('queueing');
        const pool = this.getPoolWithMinQueries();
        return pool.queue(term, globalArgs);
    }
    async createServerPool(server) {
        const pool = new server_pool_1.ServerConnectionPool(server, Object.assign({}, this.connParam, { buffer: 1, max: 1 }));
        this.serverPools = [...this.serverPools, pool];
        pool.initConnections();
        this.subscribeToPool(pool);
        return pool.waitForHealthy();
    }
    rebalanceServerPools() {
        this.getHealthyServerPools().forEach((pool, i, all) => pool.updateBufferMax({
            buffer: Math.floor(this.buffer / all.length) +
                (i === this.buffer % all.length ? 1 : 0),
            max: Math.floor(this.max / all.length) +
                (i === this.max % all.length ? 1 : 0)
        }));
    }
    async discover() {
        this.discoveryCursor = await r_1.r
            .db('rethinkdb')
            .table('server_status')
            .changes({ includeInitial: true, includeStates: true })
            .run();
        const newServers = [];
        let state = 'initializing';
        return (this.discoveryCursor
            .eachAsync(async (row) => {
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
                    this.createServerPool(server).then(() => this.rebalanceServerPools());
                }
            }
            else if (row.old_val) {
                this.removeServer(this.getServerFromStatus(row.old_val));
            }
        })
            // handle disconnections
            .catch(() => util_1.promisify(setTimeout)(20 * 1000))
            .then(() => (this.discovery ? this.discover() : undefined)));
    }
    getServerFromStatus(status) {
        const oldServer = this.servers.find(server => (server.host === status.network.hostname ||
            !!status.network.canonical_addresses.find(addr => addr.host === server.host)) &&
            server.port === status.network.reql_port);
        return (oldServer || {
            host: getCanonicalAddress(status.network.canonical_addresses),
            port: status.network.reql_port
        });
    }
    async removeServer(server) {
        if (this.servers.includes(server)) {
            this.servers = this.servers.filter(s => s !== server);
        }
        const pool = this.serverPools.find(p => server.host === p.server.host && server.port === p.server.port);
        if (pool) {
            await this.closeServerPool(pool);
            this.rebalanceServerPools();
        }
    }
    subscribeToPool(pool) {
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
            .on('available-size', () => this.emit('available-size', this.getAvailableLength()))
            .on('error', error => this.emit('error', error))
            .on('healthy', healthy => this.setHealthy(!!this.getHealthyServerPools().length));
    }
    setHealthy(healthy) {
        if (typeof healthy === 'undefined') {
            this.healthy = undefined;
        }
        else if (healthy !== this.healthy && typeof healthy !== 'undefined') {
            this.healthy = healthy;
            this.emit('healthy', healthy);
        }
    }
    closeServerPool(pool) {
        pool.removeAllListeners();
        this.serverPools = this.serverPools.filter(sp => sp !== pool);
        return pool.drain();
    }
    getHealthyServerPools() {
        return this.serverPools.filter(pool => pool.isHealthy);
    }
    getPoolWithMinQueries() {
        return this.getHealthyServerPools().reduce((min, next) => min.getNumOfRunningQueries() < next.getNumOfRunningQueries()
            ? min
            : next);
    }
    getOpenConnections() {
        return this.getConnections().filter(conn => conn.isConnected);
    }
    getIdleConnections() {
        return this.getConnections().filter(conn => !conn.numOfQueries);
    }
}
exports.MasterConnectionPool = MasterConnectionPool;
function flat(acc, next) {
    return [...acc, ...next];
}
// Try to extract the most global address
// https://github.com/neumino/rethinkdbdash/blob/f77d2ffb77a8c0fa41aabc511d74aa86ea1136d9/lib/helper.js
function getCanonicalAddress(addresses) {
    // We suppose that the addresses are all valid, and therefore use loose regex
    return addresses
        .map(address => {
        if (/^127(\.\d{1,3}){3}$/.test(address.host) ||
            /0?:?0?:?0?:?0?:?0?:?0?:0?:1/.test(address.host)) {
            return { address, value: 0 };
        }
        else if (net_1.isIPv6(address.host) &&
            /^[fF]|[eE]80:.*\:.*\:/.test(address.host)) {
            return { address, value: 1 };
        }
        else if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(address.host)) {
            return { address, value: 2 };
        }
        else if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(address.host)) {
            return { address, value: 3 };
        }
        else if (/^172\.(1\d|2\d|30|31)\.\d{1,3}\.\d{1,3}$/.test(address.host)) {
            return { address, value: 4 };
        }
        else if (/^10(\.\d{1,3}){3}$/.test(address.host)) {
            return { address, value: 5 };
        }
        else if (net_1.isIPv6(address.host) &&
            /^[fF]|[cCdD].*\:.*\:/.test('address.host')) {
            return { address, value: 6 };
        }
        else {
            return { address, value: 7 };
        }
    })
        .reduce((acc, next) => (acc.value > next.value ? acc : next)).address.host;
}
