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
const tls_1 = require("tls");
const util_1 = require("util");
const __1 = require("..");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const handshake_utils_1 = require("./handshake-utils");
class RebirthDBSocket extends events_1.EventEmitter {
    constructor({ connectionOptions, user = 'admin', password = handshake_utils_1.NULL_BUFFER }) {
        super();
        this.runningQueries = new Map();
        this.isOpen = false;
        this.nextToken = 0;
        this.buffer = new Buffer(0);
        this.mode = 'handshake';
        this.connectionOptions = setConnectionDefaults(connectionOptions);
        this.user = user;
        this.password = password;
    }
    get status() {
        if (!!this.lastError) {
            return 'errored';
        }
        else if (!this.isOpen) {
            return 'closed';
        }
        else if (this.mode === 'handshake') {
            return 'handshake';
        }
        return 'open';
    }
    eventNames() {
        return ['connect', 'query', 'data', 'release', 'error'];
    }
    async connect() {
        if (this.socket) {
            throw new error_1.RebirthDBError('Socket already connected', {
                type: __1.RebirthDBErrorType.CONNECTION
            });
        }
        const _a = this.connectionOptions, { tls = false } = _a, options = __rest(_a, ["tls"]);
        let socket = undefined;
        try {
            await new Promise((resolve, reject) => {
                socket = tls
                    ? tls_1.connect(options)
                        .once('connect', resolve)
                        .once('error', reject)
                    : net_1.connect(options)
                        .once('connect', resolve)
                        .once('error', reject);
            });
        }
        catch (err) {
            this.handleError(err);
        }
        socket.removeAllListeners();
        socket
            .on('close', () => this.close())
            .on('error', error => this.handleError(error))
            .on('data', data => {
            try {
                this.buffer = Buffer.concat([this.buffer, data]);
                switch (this.mode) {
                    case 'handshake':
                        this.handleHandshakeData();
                        break;
                    case 'response':
                        this.handleData();
                        break;
                }
            }
            catch (error) {
                this.handleError(error);
            }
        });
        socket.setKeepAlive(true);
        this.socket = socket;
        await new Promise((resolve, reject) => {
            socket.once('connect', resolve);
            socket.once('error', reject);
            if (socket.destroyed) {
                socket.removeListener('connect', resolve);
                socket.removeListener('error', reject);
                reject(this.lastError);
            }
            else if (!socket.connecting) {
                socket.removeListener('connect', resolve);
                socket.removeListener('error', reject);
                resolve();
            }
        });
        this.isOpen = true;
        await this.performHandshake();
        this.emit('connect');
    }
    sendQuery(query, token = this.nextToken++) {
        if (!this.socket || this.status !== 'open') {
            throw new error_1.RebirthDBError('`run` was called with a closed connection after:', { query, type: __1.RebirthDBErrorType.CONNECTION });
        }
        const encoded = JSON.stringify(query);
        const querySize = Buffer.byteLength(encoded);
        const buffer = new Buffer(8 + 4 + querySize);
        // tslint:disable-next-line:no-bitwise
        buffer.writeUInt32LE(token & 0xffffffff, 0);
        buffer.writeUInt32LE(Math.floor(token / 0xffffffff), 4);
        buffer.writeUInt32LE(querySize, 8);
        buffer.write(encoded, 12);
        const [type] = query;
        if (type === enums_1.QueryType.STOP) {
            this.socket.write(buffer);
            const { resolve = null, query: runningQuery = null } = this.runningQueries.get(token) || {};
            if (resolve && runningQuery) {
                // Resolving and not rejecting so there won't be "unhandled rejection" if nobody listens
                resolve(new error_1.RebirthDBError('Query cancelled', {
                    query: runningQuery,
                    type: __1.RebirthDBErrorType.CANCEL
                }));
                this.runningQueries.delete(token);
                this.emit('release', this.runningQueries.size);
            }
            return token;
        }
        const { noreply = false } = query[2] || {};
        if (noreply) {
            this.socket.write(buffer);
            this.emit('query', token);
            return token;
        }
        else {
            let resolve;
            const data = new Promise((res, rej) => (resolve = res));
            const { query: runningQuery = query, data: oldData = null } = this.runningQueries.get(token) || {};
            if (oldData) {
                oldData.then(() => {
                    if (this.socket) {
                        this.runningQueries.set(token, {
                            resolve,
                            data,
                            query: runningQuery
                        });
                        this.socket.write(buffer);
                    }
                });
            }
            else {
                this.runningQueries.set(token, {
                    resolve,
                    data,
                    query: runningQuery
                });
                this.socket.write(buffer);
                this.emit('query', token);
            }
            return token;
        }
    }
    stopQuery(token) {
        return this.sendQuery([enums_1.QueryType.STOP], token);
    }
    async readNext(token) {
        if (!this.isOpen) {
            throw this.lastError ||
                new error_1.RebirthDBError('The connection was closed before the query could be completed', {
                    type: __1.RebirthDBErrorType.CONNECTION
                });
        }
        if (!this.runningQueries.has(token)) {
            throw new error_1.RebirthDBError('No more rows in the cursor.', {
                type: __1.RebirthDBErrorType.CURSOR_END
            });
        }
        const { data = null } = this.runningQueries.get(token) || {};
        if (data) {
            const res = await data;
            if (util_1.isError(res)) {
                this.runningQueries.delete(token);
                throw res;
            }
            else if (this.status === 'handshake') {
                this.runningQueries.delete(token);
            }
            else if (util_1.isObject(res) && res.t === enums_1.ResponseType.SUCCESS_PARTIAL) {
                this.sendQuery([enums_1.QueryType.CONTINUE], token);
            }
            else {
                this.runningQueries.delete(token);
                this.emit('release', this.runningQueries.size);
            }
            return res;
        }
        return data;
    }
    close() {
        for (const { resolve, query } of this.runningQueries.values()) {
            resolve(new error_1.RebirthDBError('The connection was closed before the query could be completed', {
                query,
                type: __1.RebirthDBErrorType.CONNECTION
            }));
        }
        this.runningQueries.clear();
        if (!this.socket) {
            return;
        }
        this.socket.removeAllListeners();
        this.socket.destroy();
        this.socket = undefined;
        this.isOpen = false;
        this.mode = 'handshake';
        this.removeAllListeners();
        this.nextToken = 0;
    }
    async performHandshake() {
        let token = 0;
        const generateRunningQuery = () => {
            let resolve;
            const data = new Promise((res, rej) => (resolve = res));
            this.runningQueries.set(token++, {
                resolve,
                data,
                query: [enums_1.QueryType.START]
            });
        };
        if (!this.socket || this.status !== 'handshake') {
            throw new error_1.RebirthDBError('Connection is not open', {
                type: __1.RebirthDBErrorType.CONNECTION
            });
        }
        const { randomString, authBuffer } = handshake_utils_1.buildAuthBuffer(this.user);
        generateRunningQuery();
        generateRunningQuery();
        this.socket.write(authBuffer);
        handshake_utils_1.validateVersion(await this.readNext(0));
        const { authentication } = await this.readNext(1);
        const { serverSignature, proof } = await handshake_utils_1.computeSaltedPassword(authentication, randomString, this.user, this.password);
        generateRunningQuery();
        this.socket.write(proof);
        const { authentication: returnedSignature } = await this.readNext(2);
        handshake_utils_1.compareDigest(returnedSignature, serverSignature);
        this.mode = 'response';
    }
    handleHandshakeData() {
        let index = -1;
        while ((index = this.buffer.indexOf(0)) >= 0) {
            const strMsg = this.buffer.slice(0, index).toString('utf8');
            const { resolve = null } = this.runningQueries.get(this.nextToken++) || {};
            let err;
            try {
                const jsonMsg = JSON.parse(strMsg);
                if (jsonMsg.success) {
                    if (resolve) {
                        resolve(jsonMsg);
                    }
                }
                else {
                    err = new error_1.RebirthDBError(jsonMsg.error, {
                        errorCode: jsonMsg.error_code
                    });
                }
            }
            catch (_a) {
                err = new error_1.RebirthDBError(strMsg, { type: __1.RebirthDBErrorType.AUTH });
            }
            if (err) {
                if (resolve) {
                    resolve(err);
                }
                this.handleError(err);
            }
            this.buffer = this.buffer.slice(index + 1);
            index = this.buffer.indexOf(0);
        }
    }
    handleData() {
        while (this.buffer.length >= 12) {
            const token = this.buffer.readUInt32LE(0) + 0x100000000 * this.buffer.readUInt32LE(4);
            const responseLength = this.buffer.readUInt32LE(8);
            if (this.buffer.length < 12 + responseLength) {
                break;
            }
            const responseBuffer = this.buffer.slice(12, 12 + responseLength);
            const response = JSON.parse(responseBuffer.toString('utf8'));
            this.buffer = this.buffer.slice(12 + responseLength);
            const { resolve = null } = this.runningQueries.get(token) || {};
            if (resolve) {
                resolve(response);
            }
            this.emit('data', response, token);
        }
    }
    handleError(err) {
        this.close();
        this.lastError = err;
        if (this.listenerCount('error') > 0) {
            this.emit('error', err);
        }
    }
}
exports.RebirthDBSocket = RebirthDBSocket;
function setConnectionDefaults(connectionOptions) {
    connectionOptions.host = connectionOptions.host || 'localhost';
    connectionOptions.port = connectionOptions.port || 28015;
    return connectionOptions;
}
exports.setConnectionDefaults = setConnectionDefaults;
