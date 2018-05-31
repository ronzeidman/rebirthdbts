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
const ql2_1 = require("../proto/ql2");
const param_parser_1 = require("../query-builder/param-parser");
const cursor_1 = require("../response/cursor");
const handshake_utils_1 = require("./handshake-utils");
const socket_1 = require("./socket");
const tableQueries = [
    ql2_1.Term.TermType.TABLE_CREATE,
    ql2_1.Term.TermType.TABLE_DROP,
    ql2_1.Term.TermType.TABLE_LIST,
    ql2_1.Term.TermType.TABLE
];
class RebirthDBConnection extends events_1.EventEmitter {
    constructor({ host = 'localhost', port = 28015 } = {}, { db = 'test', user = 'admin', password = '', timeout = 20, pingInterval = -1, silent = false, log = (message) => undefined } = {}) {
        super();
        this.db = 'test';
        this.clientPort = port;
        this.clientAddress = host;
        this.timeout = timeout;
        this.pingInterval = pingInterval;
        this.silent = silent;
        this.log = log;
        this.use(db);
        this.socket = new socket_1.RebirthDBSocket({
            port,
            host,
            user,
            password: password
                ? Buffer.concat([new Buffer(password), handshake_utils_1.NULL_BUFFER])
                : handshake_utils_1.NULL_BUFFER
        });
    }
    get isConnected() {
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
    async reconnect(options, { host = this.clientAddress, port = this.clientPort } = {}) {
        this.clientPort = port;
        this.clientAddress = host;
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
            util_1.promisify(setTimeout)(this.timeout * 1000),
            this.socket.connect({}, { host, port })
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
            throw new error_1.RebirthDBError(`Failed to connect to ${host}:${port} in less than ${this.timeout}s.`);
        }
        this.startPinging();
        return this;
    }
    use(db) {
        this.db = db;
    }
    async noreplyWait() {
        const token = this.socket.sendQuery([ql2_1.Query.QueryType.NOREPLY_WAIT]);
        const result = await this.socket.readNext(token);
        if (result.t !== ql2_1.Response.ResponseType.WAIT_COMPLETE) {
            if (this.socket.status === 'errored') {
                throw this.socket.lastError;
            }
            const err = new error_1.RebirthDBError('Unexpected return value');
            this.reportError(err);
            throw err;
        }
    }
    async server() {
        const token = this.socket.sendQuery([ql2_1.Query.QueryType.SERVER_INFO]);
        const result = await this.socket.readNext(token);
        if (result.t !== ql2_1.Response.ResponseType.SERVER_INFO) {
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
        const { timeFormat, groupFormat, binaryFormat, immidiateReturn } = globalArgs, gargs = __rest(globalArgs, ["timeFormat", "groupFormat", "binaryFormat", "immidiateReturn"]);
        gargs.db = gargs.db || this.db;
        this.findTableTermAndAddDb(term, gargs.db);
        const query = [ql2_1.Query.QueryType.START, term, param_parser_1.parseOptarg(gargs)];
        const token = this.socket.sendQuery(query);
        const cursor = new cursor_1.Cursor(this.socket, token, globalArgs, query);
        if (globalArgs.immidiateReturn) {
            return cursor;
        }
        const type = await cursor.resolve();
        if (type === ql2_1.Response.ResponseType.SUCCESS_ATOM) {
            return await cursor.next();
        }
        return cursor;
    }
    findTableTermAndAddDb(term, db) {
        while (term) {
            if (!Array.isArray(term)) {
                return;
            }
            const termParam = term[1];
            if (tableQueries.includes(term[0])) {
                if (!termParam) {
                    term[1] = [[ql2_1.Term.TermType.DB, [db]]];
                    return;
                }
                const innerTerm = termParam[0];
                if (Array.isArray(innerTerm) && innerTerm[0] === ql2_1.Term.TermType.DB) {
                    return;
                }
                termParam.unshift([ql2_1.Term.TermType.DB, [db]]);
                return;
            }
            term = termParam && termParam[0];
        }
    }
    startPinging() {
        if (this.pingInterval > 0) {
            this.pingTimer = setTimeout(async () => {
                const token = this.socket.sendQuery([
                    ql2_1.Query.QueryType.START,
                    [ql2_1.Term.TermType.ERROR, ['ping']]
                ]);
                const result = await this.socket.readNext(token, 5000);
                if (result.t !== ql2_1.Response.ResponseType.RUNTIME_ERROR ||
                    result.e !== ql2_1.Response.ErrorType.USER ||
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
