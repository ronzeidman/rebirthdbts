"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const term_backtrace_1 = require("./term-backtrace");
function isRebirthDBError(error) {
    return error instanceof RebirthDBError;
}
exports.isRebirthDBError = isRebirthDBError;
class RebirthDBError extends Error {
    constructor(msg, { term, query, errorCode, backtrace, responseType, responseErrorType } = {}) {
        super(buildMessage(msg, query, term, backtrace));
        this.msg = msg;
        this.name = 'RebirthDBError';
        this.msg = msg;
        this.term = query ? query[1] : term;
        this.errorCode = errorCode;
        this.backtrace = backtrace;
        Error.captureStackTrace(this, RebirthDBError);
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
