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
    get profile() {
        return this._profile;
    }
    _read() {
        if (this.closed) {
            this.push(null);
            this.emitting = false;
        }
        this.emitting = true;
        const push = (row) => row === null
            ? this._next().then(push)
            : this.closed
                ? null
                : this.push(row);
        this._next()
            .then(push)
            .catch(err => {
            if (error_1.isRebirthDBError(err) &&
                [
                    types_1.RebirthDBErrorType.CURSOR_END,
                    types_1.RebirthDBErrorType.CANCEL,
                    types_1.RebirthDBErrorType.CONNECTION
                ].includes(err.type)) {
                if (err.type === types_1.RebirthDBErrorType.CONNECTION && !this.closed) {
                    this.emit('error', err);
                }
                this.push(null);
                this.emitting = false;
            }
            else {
                this.emit('error', err);
            }
        });
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
        if (this.conn.status === 'open') {
            this.conn.stopQuery(this.token);
        }
        this.emitting = false;
        this.closed = true;
    }
    async next() {
        if (this.emitting) {
            throw new error_1.RebirthDBError('You cannot call `next` once you have bound listeners on the Feed.', { type: types_1.RebirthDBErrorType.CURSOR });
        }
        if (this.closed) {
            throw new error_1.RebirthDBError(`You cannot call \`next\` on a closed ${this.type}`, { type: types_1.RebirthDBErrorType.CURSOR });
        }
        return await this._next();
    }
    async toArray() {
        if (this.emitting) {
            throw new error_1.RebirthDBError('You cannot call `toArray` once you have bound listeners on the Feed.', { type: types_1.RebirthDBErrorType.CURSOR });
        }
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
        if (this.emitting) {
            throw new error_1.RebirthDBError('You cannot call `each` once you have bound listeners on the Feed.', { type: types_1.RebirthDBErrorType.CURSOR });
        }
        if (this.closed) {
            callback(new error_1.RebirthDBError('You cannot retrieve data from a cursor that is closed', { type: types_1.RebirthDBErrorType.CURSOR }));
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
            if (error_1.isRebirthDBError(err) &&
                [
                    types_1.RebirthDBErrorType.CURSOR_END,
                    types_1.RebirthDBErrorType.CANCEL,
                    types_1.RebirthDBErrorType.CONNECTION
                ].includes(err.type)) {
                break;
            }
        }
        if (onFinishedCallback) {
            onFinishedCallback();
        }
    }
    async eachAsync(rowHandler, final) {
        if (this.emitting) {
            throw new error_1.RebirthDBError('You cannot call `eachAsync` once you have bound listeners on the Feed.', { type: types_1.RebirthDBErrorType.CURSOR });
        }
        if (this.closed) {
            throw new error_1.RebirthDBError('You cannot retrieve data from a cursor that is closed', { type: types_1.RebirthDBErrorType.CURSOR });
        }
        let nextRow;
        try {
            while (!this.closed) {
                nextRow = await this.next();
                if (rowHandler.length > 1) {
                    await new Promise((resolve, reject) => {
                        rowHandler(nextRow, err => err
                            ? reject(new error_1.RebirthDBError(err, { type: types_1.RebirthDBErrorType.USER }))
                            : resolve());
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
            if (!error_1.isRebirthDBError(error) ||
                ![types_1.RebirthDBErrorType.CURSOR_END, types_1.RebirthDBErrorType.CANCEL].includes(error.type)) {
                throw error;
            }
        }
    }
    async resolve() {
        try {
            const response = await this.conn.readNext(this.token);
            const { n: notes, t: type, r: results, p: profile } = response;
            this._profile = profile;
            this.position = 0;
            this.results = response_parser_1.getNativeTypes(results, this.runOptions);
            this.handleResponseNotes(type, notes);
            this.handleErrors(response);
            this.hasNextBatch =
                this.type.endsWith('Feed') || type === enums_1.ResponseType.SUCCESS_PARTIAL;
            return this.results;
        }
        catch (error) {
            this.results = undefined;
            this.hasNextBatch = false;
            throw error;
        }
    }
    async _next() {
        let results = this.getResults();
        while (util_1.isUndefined(results) ||
            (this.hasNextBatch && util_1.isUndefined(results[this.position]))) {
            await this.resolve();
            results = this.getResults();
        }
        if (util_1.isUndefined(results) || util_1.isUndefined(results[this.position])) {
            this.close();
            throw new error_1.RebirthDBError('No more rows in the cursor.', {
                type: types_1.RebirthDBErrorType.CURSOR_END
            });
        }
        return results[this.position++];
    }
    getResults() {
        return this.results &&
            this.type === 'Atom' &&
            Array.isArray(this.results[0])
            ? this.results[0]
            : this.results;
    }
    handleErrors(response) {
        const { t: type, b: backtrace, r: results, e: error } = response;
        switch (type) {
            case enums_1.ResponseType.CLIENT_ERROR:
            case enums_1.ResponseType.COMPILE_ERROR:
            case enums_1.ResponseType.RUNTIME_ERROR:
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
    return (obj !== null && typeof obj === 'object' && typeof obj.then === 'function');
}
