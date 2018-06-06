"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const connection_1 = require("../connection/connection");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const types_1 = require("../types");
const globals_1 = require("./globals");
const param_parser_1 = require("./param-parser");
const query_1 = require("./query");
const query_config_1 = require("./query-config");
const r_1 = require("./r");
function termBuilder([termType, termName, minArgs, maxArgs, optargType], currentTerm) {
    return (...args) => {
        let optarg;
        const params = !util_1.isUndefined(currentTerm) ? [currentTerm] : [];
        if (query_1.isQuery(args[0]) && args[0].term[0] === enums_1.TermType.ARGS) {
            params.push(param_parser_1.parseParam(args[0]));
            optarg = optargType !== false ? args[1] : undefined;
        }
        else {
            const argsLength = args.length;
            if (minArgs === maxArgs && argsLength !== minArgs) {
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes ${minArgs} argument${minArgs === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm, type: types_1.RebirthDBErrorType.ARITY });
            }
            if (argsLength < minArgs) {
                const termConf = query_config_1.termConfig.find(c => c[0] === termType);
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes at least ${minArgs} argument${minArgs === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm, type: types_1.RebirthDBErrorType.ARITY });
            }
            if (maxArgs !== -1 && argsLength > maxArgs) {
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes at most ${maxArgs} argument${maxArgs === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm, type: types_1.RebirthDBErrorType.ARITY });
            }
            switch (optargType) {
                case 'last':
                    optarg = param_parser_1.parseOptarg(args[maxArgs - 1]);
                    break;
                case 'required':
                case 'optional':
                case 'last-optional':
                    optarg = param_parser_1.parseOptarg(args[argsLength - 1]);
            }
            if (!optarg &&
                (optargType === 'required' ||
                    (argsLength === maxArgs &&
                        ['last', 'last-optional'].includes(optargType)))) {
                throw new error_1.RebirthDBError(`${numToString(argsLength)} argument of \`${termName}\` must be an object.`, { term: currentTerm, type: types_1.RebirthDBErrorType.ARITY });
            }
            params.push(...args
                .filter((_, i) => (optarg ? i < argsLength - 1 : true))
                .map(x => param_parser_1.parseParam(x)));
        }
        const term = [termType];
        if (params.length > 0) {
            term[1] = params;
        }
        if (optarg) {
            term[2] = optarg;
        }
        return query_1.toQuery(term);
    };
}
exports.termBuilder = termBuilder;
exports.doTermFunc = (termQuery) => {
    return (...args) => {
        const last = args.pop();
        const tb = termBuilder(query_config_1.funcall);
        return last ? tb(last, termQuery, ...args) : tb(termQuery);
    };
};
exports.runQueryFunc = (term) => {
    return async (conn, options) => {
        const c = conn instanceof connection_1.RebirthDBConnection ? conn : undefined;
        const cpool = r_1.r.getPoolMaster();
        const opt = conn instanceof connection_1.RebirthDBConnection ? options : conn;
        if (!c && !cpool) {
            throw new error_1.RebirthDBError('`run` was called without a connection and no pool has been created after:', { term, type: types_1.RebirthDBErrorType.API_FAIL });
        }
        const noreply = opt && opt.noreply;
        const cursor = c ? await c.query(term, opt) : await cpool.queue(term, opt);
        if (cursor) {
            const results = await cursor.resolve();
            if (results) {
                switch (cursor.getType()) {
                    case 'Atom':
                        return cursor.profile
                            ? { profile: cursor.profile, result: results[0] }
                            : results[0];
                    case 'Cursor':
                        return cursor.profile
                            ? { profile: cursor.profile, result: await cursor.toArray() }
                            : await cursor.toArray();
                    default:
                        return cursor;
                }
            }
        }
        return;
    };
};
exports.getCursorQueryFunc = (term) => {
    return async (conn, options) => {
        const c = conn instanceof connection_1.RebirthDBConnection ? conn : undefined;
        const cpool = r_1.r.getPoolMaster();
        const opt = conn instanceof connection_1.RebirthDBConnection ? options : conn;
        if (!c && !cpool) {
            throw new error_1.RebirthDBError('`getCursor` was called without a connection and no pool has been created after:', { term, type: types_1.RebirthDBErrorType.API_FAIL });
        }
        return c ? await c.query(term, opt) : await cpool.queue(term, opt);
    };
};
exports.expr = (arg, nestingLevel = globals_1.globals.nestingLevel) => {
    if (query_1.isQuery(arg)) {
        return arg;
    }
    return query_1.toQuery(param_parser_1.parseParam(arg, nestingLevel));
};
const numToStringArr = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
function numToString(num) {
    return numToStringArr.map((_, i) => i).includes(num)
        ? numToStringArr[num]
        : num.toString();
}
