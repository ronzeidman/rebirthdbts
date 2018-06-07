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
const data_queue_1 = require("./data-queue");
const handshake_utils_1 = require("./handshake-utils");
class RebirthDBSocket extends events_1.EventEmitter {
    constructor({ connectionOptions, user = 'admin', password = handshake_utils_1.NULL_BUFFER }) {
        super();
        this.runningQueries = new Map();
        this.mark = 0;
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
    sendQuery(newQuery, token = this.nextToken++) {
        if (!this.socket || this.status !== 'open') {
            throw new error_1.RebirthDBError('`run` was called with a closed connection after:', { query: newQuery, type: __1.RebirthDBErrorType.CONNECTION });
        }
        const encoded = JSON.stringify(newQuery);
        const querySize = Buffer.byteLength(encoded);
        const buffer = new Buffer(8 + 4 + querySize);
        // tslint:disable-next-line:no-bitwise
        buffer.writeUInt32LE(token & 0xffffffff, 0);
        buffer.writeUInt32LE(Math.floor(token / 0xffffffff), 4);
        buffer.writeUInt32LE(querySize, 8);
        buffer.write(encoded, 12);
        const { noreply = false } = newQuery[2] || {};
        if (noreply) {
            this.socket.write(buffer);
            this.emit('query', token);
            return token;
        }
        const [type] = newQuery;
        const { query = newQuery, data = null } = this.runningQueries.get(token) || {};
        if (type === enums_1.QueryType.STOP) {
            // console.log('STOP ' + token);
            this.socket.write(buffer);
            if (data) {
                // Resolving and not rejecting so there won't be "unhandled rejection" if nobody listens
                data.destroy(new error_1.RebirthDBError('Query cancelled', {
                    query,
                    type: __1.RebirthDBErrorType.CANCEL
                }));
                this.runningQueries.delete(token);
                this.emit('release', this.runningQueries.size);
            }
            return token;
        }
        else if (!data) {
            // console.log('START ' + token);
            this.runningQueries.set(token, {
                data: new data_queue_1.DataQueue(),
                query
            });
            // } else {
            // console.log('CONTINUE ' + token);
        }
        this.socket.write(buffer);
        this.emit('query', token);
        return token;
    }
    stopQuery(token) {
        if (this.runningQueries.has(token)) {
            return this.sendQuery([enums_1.QueryType.STOP], token);
        }
    }
    continueQuery(token) {
        if (this.runningQueries.has(token)) {
            // console.log('CONTINUING ' + token);
            return this.sendQuery([enums_1.QueryType.CONTINUE], token);
        }
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
        if (!data) {
            throw new error_1.RebirthDBError('Query is not running.', {
                type: __1.RebirthDBErrorType.CURSOR
            });
        }
        // console.log('WAITING ' + token);
        const res = await data.dequeue();
        // console.log('RESULT ' + token);
        if (util_1.isError(res)) {
            data.destroy(res);
            this.runningQueries.delete(token);
            throw res;
        }
        else if (this.status === 'handshake') {
            this.runningQueries.delete(token);
        }
        else if (res.t !== enums_1.ResponseType.SUCCESS_PARTIAL) {
            this.runningQueries.delete(token);
            this.emit('release', this.runningQueries.size);
        }
        // console.log('RETURNING ' + token);
        return res;
    }
    close() {
        for (const { data, query } of this.runningQueries.values()) {
            data.destroy(new error_1.RebirthDBError('The connection was closed before the query could be completed', {
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
            this.runningQueries.set(token++, {
                data: new data_queue_1.DataQueue(),
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
            const { data = null } = this.runningQueries.get(this.nextToken++) || {};
            let err;
            try {
                const jsonMsg = JSON.parse(strMsg);
                if (jsonMsg.success) {
                    if (data) {
                        data.enqueue(jsonMsg);
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
                if (data) {
                    data.destroy(err);
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
            const { data = null } = this.runningQueries.get(token) || {};
            // console.dir(response, { depth: null });
            // console.log('GOT ' + token);
            if (data) {
                data.enqueue(response);
            }
        }
    }
    handleError(err) {
        this.close();
        this.lastError = err;
        if (this.listenerCount('error') > 0) {
            this.emit('error', err);
        }
    }
    createNextData() {
        let resolve;
        const promise = new Promise((res, rej) => (resolve = res));
        return {
            promise,
            resolve,
            resolved: false
        };
    }
}
exports.RebirthDBSocket = RebirthDBSocket;
function setConnectionDefaults(connectionOptions) {
    connectionOptions.host = connectionOptions.host || 'localhost';
    connectionOptions.port = connectionOptions.port || 28015;
    return connectionOptions;
}
exports.setConnectionDefaults = setConnectionDefaults;
