"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const term_backtrace_1 = require("./term-backtrace");
function isRebirthDBError(error) {
    return error instanceof RebirthDBError;
}
exports.isRebirthDBError = isRebirthDBError;
class RebirthDBError extends Error {
    constructor(msg, { type, term, query, errorCode, backtrace, responseType, responseErrorType } = {}) {
        super(buildMessage(msg, query, term, backtrace));
        this.msg = msg;
        // tslint:disable-next-line:variable-name
        this._type = __1.RebirthDBErrorType.UNKNOWN_ERROR;
        this.name = 'RebirthDBError';
        this.msg = msg;
        this.term = query ? query[1] : term;
        this.backtrace = backtrace;
        this.setErrorType({ errorCode, type });
        Error.captureStackTrace(this, RebirthDBError);
    }
    get type() { return this._type; }
    setErrorType({ errorCode, type }) {
        if (errorCode && errorCode >= 10 && errorCode <= 20) {
            this._type = __1.RebirthDBErrorType.AUTH_ERROR;
        }
        else if (type) {
            this._type = type;
        }
    }
}
exports.RebirthDBError = RebirthDBError;
function buildMessage(msg, query, term, backtrace) {
    const t = query ? query[1] : term;
    if (t) {
        msg =
            msg.charAt(msg.length - 1) === '.'
                ? msg.substring(0, msg.length - 1) + ' in:'
                : msg;
        const [str, mark] = term_backtrace_1.backtraceTerm(t, true, backtrace);
        msg += `\n${str}`;
        if (backtrace) {
            msg += `\n${mark}\n`;
        }
    }
    return msg;
}
