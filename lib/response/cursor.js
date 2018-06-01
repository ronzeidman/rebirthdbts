"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const util_1 = require("util");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const types_1 = require("../types");
const response_parser_1 = require("./response-parser");
class Cursor extends stream_1.Readable {
    constructor(conn, token, runOptions, query, results, hasNextBatch) {
        super({ objectMode: true });
        this.conn = conn;
        this.token = token;
        this.runOptions = runOptions;
        this.query = query;
        this.results = results;
        this.hasNextBatch = hasNextBatch;
        this.position = 0;
        this.type = 'Cursor';
        this.includeStates = false;
        this.closed = false;
        this.emitting = false;
    }
    get profile() { return this._profile; }
    _read() {
        this.emitting = true;
        this.each((_, row) => {
            if (typeof row !== undefined) {
                this.push(row);
            }
            return this.emitting;
        }, () => this.push(null));
    }
    pause() {
        this.emitting = false;
        return super.pause();
    }
    resume() {
        this._read();
        return super.resume();
    }
    _destroy() {
        this.close();
    }
    toString() {
        return `[object ${this.type}]`;
    }
    getType() {
        return this.type;
    }
    async close() {
        this.conn.stopQuery(this.token);
        this.emitting = false;
        this.closed = true;
    }
    async next() {
        if (this.closed) {
            throw new error_1.RebirthDBError(`You cannot call \`next\` on a closed ${this.type}`);
        }
        if (!this.results) {
            await this.resolve();
        }
        else if (this.hasNextBatch && this.position >= this.results.length) {
            this.conn.sendQuery([enums_1.QueryType.CONTINUE], this.token);
            await this.resolve();
        }
        if (this.profile && this.type === 'Atom') {
            this.position = this.results ? this.results.length : 0;
            return {
                profile: this.profile,
                result: this.results && this.results[0]
            };
        }
        if (!this.results || !this.results[this.position]) {
            this.close();
            throw new error_1.RebirthDBError('No more rows in the cursor.', { type: types_1.RebirthDBErrorType.CURSOR_END });
        }
        return this.results[this.position++];
    }
    async toArray() {
        const all = [];
        if (!this.results) {
            await this.resolve();
            if (this.results && this.type === 'Atom') {
                const [result] = this.results;
                if (Array.isArray(result)) {
                    return result;
                }
                return [result];
            }
        }
        return this.eachAsync(async (row) => all.push(row)).then(() => all);
    }
    async each(callback, onFinishedCallback) {
        if (this.closed) {
            callback(new error_1.RebirthDBError('You cannot retrieve data from a cursor that is closed', {}));
            if (onFinishedCallback) {
                onFinishedCallback();
            }
            return;
        }
        let resume = true;
        let err;
        let next;
        while (resume !== false && !this.closed) {
            err = undefined;
            try {
                next = await this.next();
            }
            catch (error) {
                err = error;
            }
            if (err && err.type === types_1.RebirthDBErrorType.CURSOR_END) {
                break;
            }
            resume = callback(err, next);
        }
        if (onFinishedCallback) {
            onFinishedCallback();
        }
    }
    async eachAsync(rowHandler, final) {
        if (this.closed) {
            throw new error_1.RebirthDBError('You cannot retrieve data from a cursor that is closed', {});
        }
        let nextRow;
        try {
            while (!this.closed) {
                nextRow = await this.next();
                if (rowHandler.length > 1) {
                    await new Promise((resolve, reject) => {
                        rowHandler(nextRow, (err) => err ? reject(new error_1.RebirthDBError(err)) : resolve());
                    });
                }
                else {
                    const result = rowHandler(nextRow);
                    if (result !== undefined && !isPromise(result)) {
                        throw result;
                    }
                    await result;
                }
            }
        }
        catch (error) {
            if (final) {
                try {
                    await final(error);
                    return;
                }
                catch (err) {
                    error = err;
                }
            }
            if (!error_1.isRebirthDBError(error) || error.type !== types_1.RebirthDBErrorType.CURSOR_END) {
                throw error;
            }
        }
    }
    async resolve() {
        const response = await this.conn.readNext(this.token);
        const { n: notes, t: type, r: results, p: profile, } = response;
        this._profile = profile;
        this.hasNextBatch = type === enums_1.ResponseType.SUCCESS_PARTIAL;
        this.position = 0;
        this.results = response_parser_1.getNativeTypes(results, this.runOptions);
        this.handleResponseNotes(type, notes);
        this.handleErrors(response);
        return type;
    }
    handleErrors(response) {
        const { t: type, b: backtrace, r: results, e: error } = response;
        switch (type) {
            case enums_1.ResponseType.CLIENT_ERROR:
            case enums_1.ResponseType.COMPILE_ERROR:
            case enums_1.ResponseType.RUNTIME_ERROR:
                // TODO: Better error handling
                console.error(util_1.inspect(response));
                throw new error_1.RebirthDBError(results[0], {
                    responseErrorType: error,
                    responseType: type,
                    query: this.query,
                    backtrace
                });
            case enums_1.ResponseType.SUCCESS_ATOM:
            case enums_1.ResponseType.SUCCESS_PARTIAL:
            case enums_1.ResponseType.SUCCESS_SEQUENCE:
                break;
            default:
                throw new error_1.RebirthDBError('Unexpected return value');
        }
    }
    handleResponseNotes(rType, notes = []) {
        if (rType === enums_1.ResponseType.SUCCESS_ATOM) {
            this.includeStates = false;
            this.type = 'Atom';
            return;
        }
        const { type, includeStates } = notes.reduce((acc, next) => {
            switch (next) {
                case enums_1.ResponseNote.SEQUENCE_FEED:
                    acc.type = 'Feed';
                    break;
                case enums_1.ResponseNote.ATOM_FEED:
                    acc.type = 'AtomFeed';
                    break;
                case enums_1.ResponseNote.ORDER_BY_LIMIT_FEED:
                    acc.type = 'OrderByLimitFeed';
                    break;
                case enums_1.ResponseNote.UNIONED_FEED:
                    acc.type = 'UnionedFeed';
                    break;
                case enums_1.ResponseNote.INCLUDES_STATES:
                    acc.includeStates = true;
            }
            return acc;
        }, { type: 'Cursor', includeStates: true });
        this.type = type;
        this.includeStates = includeStates;
    }
}
exports.Cursor = Cursor;
function isCursor(cursor) {
    return cursor instanceof Cursor;
}
exports.isCursor = isCursor;
function isPromise(obj) {
    return obj !== null && typeof obj === 'object' && typeof obj.then === 'function';
}
