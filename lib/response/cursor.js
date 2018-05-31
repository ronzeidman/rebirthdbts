"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const error_1 = require("../error/error");
const ql2_1 = require("../proto/ql2");
const response_parser_1 = require("./response-parser");
class Cursor {
    constructor(conn, token, runOptions, query, results, hasNext) {
        this.conn = conn;
        this.token = token;
        this.runOptions = runOptions;
        this.query = query;
        this.results = results;
        this.hasNext = hasNext;
        this.position = 0;
    }
    async close() {
        this.conn.stopQuery(this.token);
    }
    async next() {
        if (!this.results) {
            await this.resolve();
        }
        else if (this.hasNext && this.position >= this.results.length) {
            this.conn.sendQuery([ql2_1.Query.QueryType.CONTINUE], this.token);
            await this.resolve();
        }
        if (this.profile) {
            this.position = this.results ? this.results.length : 0;
            return {
                profile: this.profile,
                result: this.responseType === ql2_1.Response.ResponseType.SUCCESS_ATOM &&
                    this.results
                    ? this.results[0]
                    : this.results
            };
        }
        return this.results ? this.results[this.position++] : undefined;
    }
    async toArray() {
        if (!this.results) {
            await this.resolve();
        }
        const fullResultSet = this.results || [];
        while (this.hasNext) {
            await this.next();
            fullResultSet.push(...(this.results || []));
        }
        return fullResultSet;
    }
    async eachAsync(rowHandler) {
        let nextRow = await this.next();
        while (typeof nextRow !== 'undefined') {
            await rowHandler(nextRow);
            nextRow = await this.next();
        }
    }
    async resolve() {
        const response = await this.conn.readNext(this.token);
        const { t: type, r: results, p: profile, b: backtrace, e: error } = response;
        switch (type) {
            case ql2_1.Response.ResponseType.CLIENT_ERROR:
            case ql2_1.Response.ResponseType.COMPILE_ERROR:
            case ql2_1.Response.ResponseType.RUNTIME_ERROR:
                console.error(util_1.inspect(response));
                console.error(util_1.inspect(this.query[1], { depth: null }));
                throw new error_1.RebirthDBError(response.r[0], {
                    responseErrorType: error,
                    responseType: type,
                    query: this.query,
                    backtrace
                });
            case ql2_1.Response.ResponseType.SUCCESS_ATOM:
            case ql2_1.Response.ResponseType.SUCCESS_PARTIAL:
            case ql2_1.Response.ResponseType.SUCCESS_SEQUENCE:
                this.hasNext = type === ql2_1.Response.ResponseType.SUCCESS_PARTIAL;
                this.profile = profile;
                this.results = response_parser_1.getNativeTypes(results, this.runOptions);
                this.position = 0;
                break;
            default:
                throw new error_1.RebirthDBError('Unexpected return value');
        }
        this.responseType = type;
        return type;
    }
}
exports.Cursor = Cursor;
function isCursor(cursor) {
    return cursor instanceof Cursor;
}
exports.isCursor = isCursor;
