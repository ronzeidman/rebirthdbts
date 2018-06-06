"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const util_1 = require("util");
const error_1 = require("../error/error");
const types_1 = require("../types");
const connection_1 = require("./connection");
const socket_1 = require("./socket");
const REBALANCE_EVERY = 30 * 1000;
class ServerConnectionPool extends events_1.EventEmitter {
    constructor(connectionOptions, { db = 'test', user = 'admin', password = '', buffer = 1, max = 1, timeout = 20, pingInterval = -1, timeoutError = 1000, timeoutGb = 60 * 60 * 1000, maxExponent = 6, silent = false, log = (message) => undefined } = {}) {
        super();
        this.draining = false;
        this.healthy = undefined;
        this.connections = [];
        this.timers = new Map();
        this.buffer = Math.max(buffer, 1);
        this.max = Math.max(max, buffer);
        this.timeoutError = timeoutError;
        this.timeoutGb = timeoutGb;
        this.maxExponent = maxExponent;
        this.silent = silent;
        this.log = log;
        this.server = socket_1.setConnectionDefaults(connectionOptions);
        this.connParam = { db, user, password, timeout, pingInterval, silent, log };
        this.connections = [];
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
    async initConnections() {
        if (this.connections.length < this.buffer && !this.draining) {
            return this.createConnection().then(() => this.initConnections());
        }
    }
    get isHealthy() {
        return this.connections.some(conn => conn.open);
    }
    waitForHealthy() {
        return new Promise((resolve, reject) => {
            if (this.isHealthy) {
                resolve(this);
            }
            else {
                this.once('healthy', healthy => {
                    if (healthy) {
                        resolve(this);
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
    async setOptions({ buffer = this.buffer, max = this.max, silent = this.silent, log = this.log, timeoutError = this.timeoutError, timeoutGb = this.timeoutGb, maxExponent = this.maxExponent }) {
        this.silent = silent;
        this.log = log;
        this.timeoutError = timeoutError;
        this.timeoutGb = timeoutGb;
        this.maxExponent = maxExponent;
        if (this.buffer < buffer && this.connections.length < buffer) {
            this.buffer = buffer;
            await this.initConnections();
        }
        else {
            this.connections.forEach(conn => this.checkIdle(conn));
        }
        if (this.max > max) {
            const connections = this.getIdleConnections();
            for (let i = 0; i < this.max - max; i++) {
                const conn = connections.pop();
                if (!conn) {
                    break;
                }
                await this.closeConnection(conn);
            }
        }
        this.max = max;
    }
    async drain({ noreplyWait = false } = {}, emit = true) {
        if (emit) {
            this.emit('draining');
            this.setHealthy(undefined);
        }
        this.draining = true;
        await Promise.all(this.connections.map(conn => this.closeConnection(conn)));
    }
    getConnections() {
        return this.connections;
    }
    getLength() {
        return this.getOpenConnections().length;
    }
    getAvailableLength() {
        return this.getIdleConnections().length;
    }
    getNumOfRunningQueries() {
        return this.getOpenConnections().reduce((num, next) => next.numOfQueries + num, 0);
    }
    async queue(term, globalArgs = {}) {
        this.emit('queueing');
        const openConnections = this.getOpenConnections();
        if (!openConnections) {
            throw this.reportError(new error_1.RebirthDBError('No connections available', {
                type: types_1.RebirthDBErrorType.POOL_FAIL
            }), true);
        }
        const minQueriesRunningConnection = openConnections.reduce(minQueriesRunning);
        if (this.connections.length < this.max) {
            this.createConnection();
        }
        return minQueriesRunningConnection.query(term, globalArgs);
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
    async createConnection() {
        const conn = new connection_1.RebirthDBConnection(this.server, this.connParam);
        this.connections = [...this.connections, conn];
        return await this.persistConnection(conn);
    }
    subscribeToConnection(conn) {
        if (conn.open && !this.draining) {
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
                    // this.drain({}, false).then(() => this.initConnections());
                }
                conn.removeAllListeners();
                this.persistConnection(conn);
            })
                .on('data', () => this.checkIdle(conn))
                .on('query', () => this.checkIdle(conn));
        }
    }
    async closeConnection(conn) {
        this.removeIdleTimer(conn);
        conn.removeAllListeners();
        this.connections = this.connections.filter(c => c !== conn);
        await conn.close();
        this.emit('size', this.getOpenConnections().length);
    }
    checkIdle(conn) {
        this.removeIdleTimer(conn);
        if (!conn.numOfQueries) {
            this.emit('available-size', this.getIdleConnections().length);
            this.timers.set(conn, setTimeout(() => {
                this.timers.delete(conn);
                if (this.connections.length > this.buffer) {
                    this.closeConnection(conn).then(() => this.emit('available-size', this.getIdleConnections().length));
                }
            }, this.timeoutGb));
        }
    }
    removeIdleTimer(conn) {
        const timer = this.timers.get(conn);
        if (timer) {
            clearTimeout(timer);
        }
        this.timers.delete(conn);
    }
    async persistConnection(conn) {
        let exp = 0;
        while (this.connections.includes(conn) && !conn.open && !this.draining) {
            try {
                await conn.reconnect();
            }
            catch (err) {
                this.reportError(err);
                if (this.connections.length > this.buffer) {
                    // if trying to go above buffer and failing just use one of the open connections
                    this.closeConnection(conn);
                    break;
                }
                if (util_1.isUndefined(this.healthy)) {
                    this.setHealthy(false);
                }
                await new Promise(resolve => setTimeout(resolve, 2 ** exp * this.timeoutError));
                exp = Math.min(exp + 1, this.maxExponent);
            }
        }
        if (!this.connections.includes(conn) || this.draining) {
            // draining/removing
            await this.closeConnection(conn);
            return;
        }
        this.subscribeToConnection(conn);
        return conn;
    }
    reportError(err, log = false) {
        if (this.listenerCount('error') > 0) {
            this.emit('error', err);
        }
        if (log) {
            this.log(err.toString());
            if (!this.silent) {
                console.error(err.toString());
            }
        }
        return err;
    }
    getOpenConnections() {
        return this.connections.filter(conn => conn.open);
    }
    getIdleConnections() {
        return this.getOpenConnections().filter(conn => !conn.numOfQueries);
    }
}
exports.ServerConnectionPool = ServerConnectionPool;
function minQueriesRunning(acc, next) {
    return acc.numOfQueries <= next.numOfQueries ? acc : next;
}
