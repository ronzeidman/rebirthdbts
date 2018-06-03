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
const util_1 = require("util");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const globals_1 = require("../query-builder/globals");
const param_parser_1 = require("../query-builder/param-parser");
const cursor_1 = require("../response/cursor");
const handshake_utils_1 = require("./handshake-utils");
const socket_1 = require("./socket");
const tableQueries = [
    enums_1.TermType.TABLE_CREATE,
    enums_1.TermType.TABLE_DROP,
    enums_1.TermType.TABLE_LIST,
    enums_1.TermType.TABLE
];
class RebirthDBConnection extends events_1.EventEmitter {
    constructor(connectionOptions, { db = 'test', user = 'admin', password = '', timeout = 20, pingInterval = -1, silent = false, log = (message) => undefined } = {}) {
        super();
        this.connectionOptions = connectionOptions;
        this.db = 'test';
        this.options = socket_1.setConnectionDefaults(connectionOptions);
        this.clientPort = connectionOptions.port || 28015;
        this.clientAddress = connectionOptions.host || 'localhost';
        connectionOptions.port = this.clientPort;
        connectionOptions.host = this.clientAddress;
        this.timeout = timeout;
        this.pingInterval = pingInterval;
        this.silent = silent;
        this.log = log;
        this.use(db);
        this.socket = new socket_1.RebirthDBSocket({
            connectionOptions: this.options,
            user,
            password: password
                ? Buffer.concat([new Buffer(password), handshake_utils_1.NULL_BUFFER])
                : handshake_utils_1.NULL_BUFFER
        });
    }
    eventNames() {
        return ['release', 'close', 'timeout', 'error'];
    }
    get open() {
        return this.socket.status === 'open';
    }
    get numOfQueries() {
        return this.socket.runningQueries.length;
    }
    async close({ noreplyWait = false } = {}) {
        try {
            this.stopPinging();
            if (noreplyWait) {
                await this.noreplyWait();
            }
            this.socket.close();
        }
        catch (err) {
            this.socket.close();
            throw err;
        }
    }
    async reconnect(options) {
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
            this.reportError(this.socket.lastError);
            this.emit('close');
            this.close();
            throw this.socket.lastError;
        }
        if (this.socket.status !== 'open') {
            this.emit('timeout');
            this.emit('close');
            this.close();
            throw new error_1.RebirthDBError(`Failed to connect to ${this.connectionOptions.host}:${this.connectionOptions.port} in less than ${this.timeout}s.`);
        }
        this.startPinging();
        return this;
    }
    use(db) {
        this.db = db;
    }
    async noreplyWait() {
        const token = this.socket.sendQuery([enums_1.QueryType.NOREPLY_WAIT]);
        const result = await this.socket.readNext(token);
        if (result.t !== enums_1.ResponseType.WAIT_COMPLETE) {
            if (this.socket.status === 'errored') {
                throw this.socket.lastError;
            }
            const err = new error_1.RebirthDBError('Unexpected return value');
            this.reportError(err);
            throw err;
        }
    }
    async server() {
        const token = this.socket.sendQuery([enums_1.QueryType.SERVER_INFO]);
        const result = await this.socket.readNext(token);
        if (result.t !== enums_1.ResponseType.SERVER_INFO) {
            if (this.socket.status === 'errored') {
                throw this.socket.lastError;
            }
            const err = new error_1.RebirthDBError('Unexpected return value');
            this.reportError(err);
            throw err;
        }
        return result.r[0];
    }
    async query(term, globalArgs = {}) {
        const { timeFormat, groupFormat, binaryFormat } = globalArgs, gargs = __rest(globalArgs, ["timeFormat", "groupFormat", "binaryFormat"]);
        gargs.db = gargs.db || this.db;
        this.findTableTermAndAddDb(term, gargs.db);
        if (!util_1.isUndefined(globals_1.globals.arrayLimit) && util_1.isUndefined(gargs.arrayLimit)) {
            gargs.arrayLimit = globals_1.globals.arrayLimit;
        }
        const query = [enums_1.QueryType.START, term, param_parser_1.parseOptarg(gargs)];
        const token = this.socket.sendQuery(query);
        if (globalArgs.noreply) {
            return;
        }
        return new cursor_1.Cursor(this.socket, token, globalArgs, query);
    }
    findTableTermAndAddDb(term, db) {
        while (term) {
            if (!Array.isArray(term)) {
                return;
            }
            const termParam = term[1];
            if (tableQueries.includes(term[0])) {
                if (!termParam) {
                    term[1] = [[enums_1.TermType.DB, [db]]];
                    return;
                }
                const innerTerm = termParam[0];
                if (Array.isArray(innerTerm) && innerTerm[0] === enums_1.TermType.DB) {
                    return;
                }
                termParam.unshift([enums_1.TermType.DB, [db]]);
                return;
            }
            term = termParam && termParam[0];
        }
    }
    startPinging() {
        if (this.pingInterval > 0) {
            this.pingTimer = setTimeout(async () => {
                const token = this.socket.sendQuery([
                    enums_1.QueryType.START,
                    [enums_1.TermType.ERROR, ['ping']]
                ]);
                const result = await this.socket.readNext(token, 5000);
                if (result.t !== enums_1.ResponseType.RUNTIME_ERROR ||
                    result.e !== enums_1.ErrorType.USER ||
                    result.r[0] !== 'ping') {
                    this.reportError(new error_1.RebirthDBError('Ping error'));
                }
                if (this.pingTimer) {
                    this.startPinging();
                }
            }, this.pingInterval);
        }
    }
    stopPinging() {
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
        }
        this.pingTimer = undefined;
    }
    reportError(err) {
        this.emit('error', err);
        this.log(err.toString());
        if (!this.silent) {
            console.error(err.toString());
        }
    }
}
exports.RebirthDBConnection = RebirthDBConnection;
