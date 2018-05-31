"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const util_1 = require("util");
const error_1 = require("../error/error");
const connection_1 = require("./connection");
const REBALANCE_EVERY = 30 * 1000;
class ServerConnectionPool extends events_1.EventEmitter {
    constructor({ host = 'localhost', port = 28015 } = {}, { db = 'test', user = 'admin', password = '', buffer = 1, max = 1, timeout = 20, pingInterval = -1, timeoutError = 1000, timeoutGb = 60 * 60 * 1000, maxExponent = 6, silent = false, log = (message) => undefined } = {}) {
        super();
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
        this.server = { host, port };
        this.connParam = { db, user, password, timeout, pingInterval, silent, log };
        this.connections = [];
    }
    async initConnections() {
        if (this.connections.length < this.buffer) {
            return this.createConnection().then(() => this.initConnections());
        }
    }
    get isHealthy() {
        return this.connections.some(conn => conn.isConnected);
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
        if (this.buffer > buffer && this.connections.length < buffer) {
            this.buffer = buffer;
            this.initConnections();
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
                this.closeConnection(conn);
            }
        }
        this.max = max;
    }
    async drain({ noreplyWait = false } = {}, emit = true) {
        if (emit) {
            this.emit('draining');
            this.setHealthy(undefined);
        }
        await Promise.all(this.connections.map(conn => {
            conn.removeAllListeners();
            return conn.close({ noreplyWait });
        }));
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
        const idleConnections = this.getIdleConnections();
        if (!idleConnections.length) {
            if (this.connections.length < this.max &&
                this.connections.length > this.buffer) {
                const conn = await this.createConnection();
                if (conn) {
                    // if couldnt go above buffer try using an open connection instead of waiting for timeout and reconnect
                    return conn.query(term, globalArgs);
                }
            }
            const openConnections = this.getOpenConnections();
            if (!openConnections.length) {
                throw this.reportError(new error_1.RebirthDBError('No connections available'));
            }
            return openConnections.reduce(minQueriesRunning).query(term, globalArgs);
        }
        return idleConnections[0].query(term, globalArgs);
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
    async createConnection() {
        const conn = new connection_1.RebirthDBConnection(this.server, this.connParam);
        this.connections = [...this.connections, conn];
        return await this.persistConnection(conn);
    }
    subscribeToConnection(conn) {
        if (conn.isConnected) {
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
    closeConnection(conn) {
        this.removeIdleTimer(conn);
        conn.removeAllListeners();
        conn.close();
        this.connections = this.connections.filter(c => c !== conn);
        this.emit('size', this.getOpenConnections().length);
    }
    checkIdle(conn) {
        if (!conn.numOfQueries) {
            this.emit('available-size', this.getIdleConnections().length);
            this.timers.set(conn, setTimeout(() => {
                this.timers.delete(conn);
                if (this.connections.length > this.buffer) {
                    this.closeConnection(conn);
                    this.emit('available-size', this.getIdleConnections().length);
                }
            }, this.timeoutGb));
        }
        else {
            this.removeIdleTimer(conn);
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
        while (this.connections.includes(conn) && !conn.isConnected) {
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
                if (typeof this.healthy === 'undefined') {
                    this.setHealthy(false);
                }
                await util_1.promisify(setTimeout)(2 ** exp * this.timeoutError);
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
    reportError(err) {
        this.emit('error', err);
        this.log(err.toString());
        if (!this.silent) {
            console.error(err.toString());
        }
        return err;
    }
    getOpenConnections() {
        return this.connections.filter(conn => conn.isConnected);
    }
    getIdleConnections() {
        return this.getOpenConnections().filter(conn => !conn.numOfQueries);
    }
}
exports.ServerConnectionPool = ServerConnectionPool;
function minQueriesRunning(acc, next) {
    return acc.numOfQueries <= next.numOfQueries ? acc : next;
}
