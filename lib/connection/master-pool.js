"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const net_1 = require("net");
const util_1 = require("util");
const error_1 = require("../error/error");
const r_1 = require("../query-builder/r");
const types_1 = require("../types");
const server_pool_1 = require("./server-pool");
const socket_1 = require("./socket");
class MasterConnectionPool extends events_1.EventEmitter {
    constructor({ db = 'test', user = 'admin', password = '', discovery = false, servers = [{ host: 'localhost', port: 28015 }], buffer = servers.length, max = servers.length, timeout = 20, pingInterval = -1, timeoutError = 1000, timeoutGb = 60 * 60 * 1000, maxExponent = 6, silent = false, log = (message) => undefined } = {}) {
        super();
        this.draining = false;
        this.healthy = undefined;
        // min one per server but wont redistribute conn from failed servers
        this.discovery = discovery;
        this.connParam = {
            db,
            user,
            password,
            buffer: Math.max(buffer, 1),
            max: Math.max(max, buffer),
            timeout,
            pingInterval,
            timeoutError,
            timeoutGb,
            maxExponent,
            silent,
            log
        };
        this.servers = servers.map(socket_1.setConnectionDefaults);
        this.serverPools = [];
    }
    setOptions({ discovery = this.discovery, buffer = this.connParam.buffer, max = this.connParam.max, timeoutError = this.connParam.timeoutError, timeoutGb = this.connParam.timeoutGb, maxExponent = this.connParam.maxExponent, silent = this.connParam.silent, log = this.connParam.log }) {
        if (this.discovery !== discovery) {
            this.discovery = discovery;
            if (discovery) {
                this.discover();
            }
            else if (this.discoveryCursor) {
                this.discoveryCursor.close();
            }
        }
        this.connParam = Object.assign({}, this.connParam, { buffer,
            max,
            timeoutError,
            timeoutGb,
            maxExponent,
            silent,
            log });
        this.setServerPoolsOptions(this.connParam);
    }
    eventNames() {
        return [
            'draining',
            'queueing',
            'size',
            'available-size',
            'healthy',
            'error'
        ];
    }
    async initServers(serverNum = 0) {
        if (serverNum < this.servers.length) {
            return this.createServerPool(this.servers[serverNum]).then(pool => {
                if (!this.draining) {
                    return this.initServers(serverNum + 1);
                }
                else {
                    return pool.drain();
                }
            });
        }
        else if (!this.draining) {
            this.setServerPoolsOptions(this.connParam);
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
                        reject(new error_1.RebirthDBError('Error initializing pool', {
                            type: types_1.RebirthDBErrorType.POOL_FAIL
                        }));
                    }
                });
            }
        });
    }
    async drain({ noreplyWait = false } = {}) {
        this.emit('draining');
        this.draining = true;
        this.discovery = false;
        if (this.discoveryCursor) {
            this.discoveryCursor.close();
        }
        this.setHealthy(false);
        await Promise.all(this.serverPools.map(pool => this.closeServerPool(pool)));
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
        if (!this.isHealthy) {
            throw new error_1.RebirthDBError('None of the pools have an opened connection and failed to open a new one.', { type: types_1.RebirthDBErrorType.POOL_FAIL });
        }
        this.emit('queueing');
        const pool = this.getPoolWithMinQueries();
        return pool.queue(term, globalArgs);
    }
    async createServerPool(server) {
        const pool = new server_pool_1.ServerConnectionPool(server, Object.assign({}, this.connParam, { buffer: 1, max: 1 }));
        this.serverPools.push(pool);
        this.subscribeToPool(pool);
        pool.initConnections().catch(() => undefined);
        return pool.waitForHealthy();
    }
    setServerPoolsOptions(params) {
        const { buffer = 1, max = 1 } = params, otherParams = __rest(params, ["buffer", "max"]);
        const pools = this.getPools();
        const healthyLength = pools.filter(pool => pool.isHealthy).length;
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i];
            pool
                .setOptions(pool.isHealthy
                ? Object.assign({}, otherParams, { buffer: Math.floor(buffer / healthyLength) +
                        (i === (buffer % healthyLength) - 1 ? 1 : 0), max: Math.floor(max / healthyLength) +
                        (i === (max % healthyLength) - 1 ? 1 : 0) }) : otherParams)
                .then(() => {
                if (this.draining) {
                    pool.drain();
                }
            });
        }
        if (this.draining) {
            pools.forEach(pool => pool.drain());
        }
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
                    this.createServerPool(server).then(() => this.setServerPoolsOptions(this.connParam));
                }
            }
            else if (row.old_val) {
                this.removeServer(this.getServerFromStatus(row.old_val));
            }
        })
            // handle disconnections
            .catch(() => new Promise(resolve => setTimeout(resolve, 20 * 1000)))
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
            this.setServerPoolsOptions(this.connParam);
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
            .on('error', error => {
            if (this.listenerCount('error') > 0) {
                this.emit('error', error);
            }
        })
            .on('healthy', healthy => {
            if (!healthy) {
                const { server } = pool;
                this.closeServerPool(pool)
                    .then(() => new Promise(resolve => setTimeout(resolve, this.connParam.timeoutError)))
                    .then(() => {
                    if (!this.draining) {
                        return this.createServerPool(server).catch(() => undefined);
                    }
                });
            }
            this.setHealthy(!!this.getHealthyServerPools().length);
        });
    }
    setHealthy(healthy) {
        if (util_1.isUndefined(healthy)) {
            this.healthy = undefined;
        }
        else if (healthy !== this.healthy && !util_1.isUndefined(healthy)) {
            this.healthy = healthy;
            this.emit('healthy', healthy);
        }
    }
    async closeServerPool(pool) {
        if (pool) {
            pool.removeAllListeners();
            const index = this.serverPools.indexOf(pool);
            if (index >= 0) {
                this.serverPools.splice(index, 1);
            }
            return pool.drain();
        }
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
        return this.getConnections().filter(conn => conn.open);
    }
    getIdleConnections() {
        return this.getOpenConnections().filter(conn => !conn.numOfQueries);
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
