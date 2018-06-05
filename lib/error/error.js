"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const enums_1 = require("../proto/enums");
const globals_1 = require("../query-builder/globals");
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
        this._type = __1.RebirthDBErrorType.UNKNOWN;
        this.name = 'ReqlDriverError';
        this.msg = msg;
        this.term = query ? query[1] : term;
        this.backtrace = backtrace;
        this.setErrorType({ errorCode, type, responseErrorType });
        Error.captureStackTrace(this, RebirthDBError);
    }
    get type() {
        return this._type;
    }
    setErrorType({ errorCode, type, responseErrorType }) {
        if (type) {
            this.name = 'ReqlDriverError';
            this._type = type;
        }
        else if (errorCode && errorCode >= 10 && errorCode <= 20) {
            // https://rethinkdb.com/docs/writing-drivers/
            // A ReqlAuthError should be thrown if the error code is between 10 and 20 (inclusive)
            // what about other error codes?
            this.name = 'ReqlAuthError';
            this._type = __1.RebirthDBErrorType.AUTH;
        }
        else if (responseErrorType) {
            switch (responseErrorType) {
                case enums_1.ErrorType.INTERNAL:
                    this.name = 'ReqlInternalError';
                    this._type = __1.RebirthDBErrorType.INTERNAL;
                    break;
                case enums_1.ErrorType.NON_EXISTENCE:
                    this.name = 'ReqlNonExistanceError';
                    this._type = __1.RebirthDBErrorType.NON_EXISTENCE;
                    break;
                case enums_1.ErrorType.OP_FAILED:
                    this.name = 'ReqlOpFailedError';
                    this._type = __1.RebirthDBErrorType.OP_FAILED;
                    break;
                case enums_1.ErrorType.OP_INDETERMINATE:
                    this.name = 'ReqlOpIndeterminateError';
                    this._type = __1.RebirthDBErrorType.OP_INDETERMINATE;
                    break;
                case enums_1.ErrorType.PERMISSION_ERROR:
                    this.name = 'ReqlPermissionError';
                    this._type = __1.RebirthDBErrorType.PERMISSION_ERROR;
                    break;
                case enums_1.ErrorType.QUERY_LOGIC:
                    this.name = 'ReqlLogicError';
                    this._type = __1.RebirthDBErrorType.QUERY_LOGIC;
                    break;
                case enums_1.ErrorType.RESOURCE_LIMIT:
                    this.name = 'ReqlResourceError';
                    this._type = __1.RebirthDBErrorType.RESOURCE_LIMIT;
                    break;
                case enums_1.ErrorType.USER:
                    this.name = 'ReqlUserError';
                    this._type = __1.RebirthDBErrorType.USER;
                    break;
            }
        }
        else {
            this.name = 'ReqlUnknownError';
        }
    }
}
exports.RebirthDBError = RebirthDBError;
function buildMessage(msg, query, term, backtrace) {
    const t = query ? query[1] : term;
    if (t) {
        msg =
            msg.charAt(msg.length - 1) === ':'
                ? msg
                : msg.charAt(msg.length - 1) === '.'
                    ? msg.substring(0, msg.length - 1) + ' in:'
                    : msg + ' in:';
        const [str, mark] = term_backtrace_1.backtraceTerm(t, true, backtrace);
        if (globals_1.globals.pretty) {
            msg += `\n${pretty(str, mark)}`;
        }
        else {
            msg += `\n${str}\n`;
            if (backtrace) {
                msg += `${mark}\n`;
            }
        }
    }
    return msg;
}
function pretty(query, mark) {
    let result = '';
    let indent = 0;
    const openIndentPos = [];
    let char = '';
    let newline = true;
    let lastNewlinePos = 0;
    let lineMarkPos = 0;
    let lineMark = '';
    let nextSign = '';
    for (let i = 0; i < query.length; i++) {
        char = query.charAt(i);
        switch (char) {
            case '.':
                if (result.length - lastNewlinePos >= 80) {
                    indent += 4;
                    lineMark += mark.substring(lineMarkPos, i);
                    lineMarkPos = i + 1;
                    result = result.trimRight();
                    nextSign =
                        lineMark.charAt(result.length - lastNewlinePos) || mark.charAt(i);
                    lineMark = lineMark.substring(0, result.length - lastNewlinePos);
                    result += lineMark.includes('^')
                        ? `\n${lineMark}\n${' '.repeat(indent)}.`
                        : `\n${' '.repeat(indent)}.`;
                    lastNewlinePos = result.length - indent - 1;
                    lineMark = ' '.repeat(indent) + nextSign;
                }
                else {
                    result += '.';
                }
                newline = false;
                break;
            // case ',':
            //   newline = true;
            //   lineMark += mark.substring(lineMarkPos, i);
            //   lineMarkPos = i + 1;
            //   result += lineMark.includes('^')
            //     ? `,\n${lineMark}\n${' '.repeat(indent)}`
            //     : `,\n${' '.repeat(indent)}`;
            //   lastNewlinePos = result.length - indent;
            //   lineMark = ' '.repeat(indent);
            // break;
            case '{':
                newline = true;
                openIndentPos.push(indent);
                // indent += result
                //   .substring(result.lastIndexOf('\n') + 1)
                //   .trimLeft()
                //   .startsWith('.')
                //   ? 5
                //   : 4;
                indent += 4;
                lineMark += mark.substring(lineMarkPos, i + 1);
                lineMarkPos = i + 1;
                result += lineMark.includes('^')
                    ? `{\n${lineMark}\n${' '.repeat(indent)}`
                    : `{\n${' '.repeat(indent)}`;
                lastNewlinePos = result.length - indent;
                lineMark = ' '.repeat(indent);
                break;
            case '}':
                newline = false;
                indent = openIndentPos.pop() || 0;
                lineMark += mark.substring(lineMarkPos, i);
                lineMarkPos = i + 1;
                result = result.trimRight();
                nextSign =
                    lineMark.charAt(result.length - lastNewlinePos) || mark.charAt(i);
                lineMark = lineMark.substring(0, result.length - lastNewlinePos);
                result += lineMark.includes('^')
                    ? `\n${lineMark}\n${' '.repeat(indent)}}`
                    : `\n${' '.repeat(indent)}}`;
                lastNewlinePos = result.length - indent - 1;
                lineMark = ' '.repeat(indent) + nextSign;
                break;
            case ' ':
                if (newline) {
                    lineMarkPos++;
                }
                else {
                    result += ' ';
                }
                break;
            default:
                newline = false;
                result += char;
                break;
        }
    }
    lineMark += mark.substring(lineMarkPos, query.length);
    result = result.trimRight();
    lineMark = lineMark.substring(0, result.length - lastNewlinePos);
    result += lineMark.includes('^') ? `\n${lineMark}\n` : '\n';
    return result;
}
