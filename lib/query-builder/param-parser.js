"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const __1 = require("..");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const globals_1 = require("./globals");
const query_1 = require("./query");
function parseParam(param, nestingLevel = globals_1.globals.nestingLevel) {
    if (nestingLevel === 0) {
        throw new error_1.RebirthDBError('Nesting depth limit exceeded.\nYou probably have a circular reference somewhere.', { type: __1.RebirthDBErrorType.PARSE });
    }
    if (param === null) {
        return null;
    }
    if (query_1.isQuery(param)) {
        if (util_1.isUndefined(param.term)) {
            throw new error_1.RebirthDBError("'r' cannot be an argument", {
                type: __1.RebirthDBErrorType.PARSE
            });
        }
        return param.term;
    }
    if (Array.isArray(param)) {
        return [
            enums_1.TermType.MAKE_ARRAY,
            param.map(p => parseParam(p, nestingLevel - 1))
        ];
    }
    if (util_1.isDate(param)) {
        return {
            $reql_type$: 'TIME',
            epoch_time: param.getTime(),
            timezone: '+00:00'
        };
    }
    if (util_1.isBuffer(param)) {
        return {
            $reql_type$: 'BINARY',
            data: param.toString('base64')
        };
    }
    if (util_1.isFunction(param)) {
        const { nextVarId } = globals_1.globals;
        globals_1.globals.nextVarId = nextVarId + param.length;
        try {
            const funcResult = param(...Array(param.length)
                .fill(0)
                .map((_, i) => query_1.toQuery([enums_1.TermType.VAR, [i + nextVarId]])));
            if (util_1.isUndefined(funcResult)) {
                throw new error_1.RebirthDBError(`Anonymous function returned \`undefined\`. Did you forget a \`return\`? in:\n${param.toString()}`, { type: __1.RebirthDBErrorType.PARSE });
            }
            const term = [
                enums_1.TermType.FUNC,
                [
                    [
                        enums_1.TermType.MAKE_ARRAY,
                        Array(param.length)
                            .fill(0)
                            .map((_, i) => i + nextVarId)
                    ],
                    parseParam(funcResult)
                ]
            ];
            return term;
        }
        finally {
            globals_1.globals.nextVarId = nextVarId;
        }
    }
    if (typeof param === 'object') {
        return Object.entries(param).reduce((acc, [key, value]) => (Object.assign({}, acc, { [key]: parseParam(value, nestingLevel - 1) })), {});
    }
    if (typeof param === 'number' && (isNaN(param) || !isFinite(param))) {
        throw new error_1.RebirthDBError(`Cannot convert \`${param}\` to JSON`, {
            type: __1.RebirthDBErrorType.PARSE
        });
    }
    return param;
}
exports.parseParam = parseParam;
function parseOptarg(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => (Object.assign({}, acc, { [camelToSnake(key)]: parseParam(value) })), {});
}
exports.parseOptarg = parseOptarg;
function camelToSnake(name) {
    return name.replace(/([A-Z])/g, x => `_${x.toLowerCase()}`);
}
