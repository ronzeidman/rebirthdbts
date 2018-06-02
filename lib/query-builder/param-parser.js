"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const query_1 = require("./query");
const r_1 = require("./r");
function parseParam(param) {
    if (param === null) {
        return null;
    }
    if (query_1.isQuery(param)) {
        if (util_1.isUndefined(param.term)) {
            throw new error_1.RebirthDBError("'r' cannot be an argument");
        }
        return param.term;
    }
    if (Array.isArray(param)) {
        return [enums_1.TermType.MAKE_ARRAY, param.map(p => parseParam(p))];
    }
    if (util_1.isDate(param)) {
        return {
            $reql_type$: 'TIME',
            epochTime: param.getTime(),
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
        const { nextVarId } = r_1.r;
        r_1.r.nextVarId = nextVarId + param.length;
        const term = [
            enums_1.TermType.FUNC,
            [
                [
                    enums_1.TermType.MAKE_ARRAY,
                    Array(param.length)
                        .fill(0)
                        .map((_, i) => i + nextVarId)
                ],
                parseParam(param(...Array(param.length)
                    .fill(0)
                    .map((_, i) => query_1.toQuery([enums_1.TermType.VAR, [i + 1]]))))
            ]
        ];
        r_1.r.nextVarId = nextVarId;
        return term;
    }
    if (typeof param === 'object') {
        return Object.entries(param).reduce((acc, [key, value]) => (Object.assign({}, acc, { [key]: parseParam(value) })), {});
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
