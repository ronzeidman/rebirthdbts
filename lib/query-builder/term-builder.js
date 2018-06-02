"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const connection_1 = require("../connection/connection");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
const param_parser_1 = require("./param-parser");
const query_1 = require("./query");
const query_config_1 = require("./query-config");
const r_1 = require("./r");
function termBuilder([termType, termName, minArgs, maxArgs, hasOptarg], currentTerm) {
    return (...args) => {
        let optarg;
        const params = !util_1.isUndefined(currentTerm) ? [currentTerm] : [];
        if (query_1.isQuery(args[0]) && args[0].term[0] === enums_1.TermType.ARGS) {
            params.push(param_parser_1.parseParam(args[0]));
            optarg = hasOptarg ? args[1] : undefined;
        }
        else {
            const argsLength = args.length;
            const maxArgsPlusOptarg = hasOptarg && maxArgs >= 0 ? maxArgs + 1 : maxArgs;
            if (minArgs === maxArgsPlusOptarg && argsLength !== minArgs) {
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes ${minArgs} argument${minArgs === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm });
            }
            if (argsLength < minArgs) {
                const termConf = query_config_1.termConfig.find(c => c[0] === termType);
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes at least ${minArgs} argument${minArgs === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm });
            }
            if (maxArgs !== -1 && argsLength > maxArgsPlusOptarg) {
                throw new error_1.RebirthDBError(`\`${!currentTerm ? `r.${termName}` : termName}\` takes at most ${maxArgsPlusOptarg} argument${maxArgsPlusOptarg === 1 ? '' : 's'}, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`, { term: currentTerm });
            }
            const maybeOptarg = args.length ? args.pop() : undefined;
            optarg =
                hasOptarg &&
                    (((maxArgsPlusOptarg > 0 && argsLength >= maxArgsPlusOptarg) ||
                        argsLength > minArgs) &&
                        (!Array.isArray(maybeOptarg) &&
                            typeof maybeOptarg === 'object' &&
                            !query_1.isQuery(maybeOptarg)))
                    ? maybeOptarg
                    : undefined;
            if (hasOptarg && argsLength === maxArgsPlusOptarg && !optarg) {
                throw new error_1.RebirthDBError(`${numToString(argsLength)} argument of \`${termName}\` must be an object.`, { term: currentTerm });
            }
            if (!util_1.isUndefined(maybeOptarg) && util_1.isUndefined(optarg)) {
                args.push(maybeOptarg);
            }
            params.push(...args.map(param_parser_1.parseParam));
        }
        const term = [termType];
        if (params.length > 0) {
            term[1] = params;
        }
        if (optarg) {
            term[2] = param_parser_1.parseOptarg(optarg);
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
            throw new error_1.RebirthDBError('`run` was called without a connection and no pool has been created after:', { term });
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
            throw new error_1.RebirthDBError('`getCursor` was called without a connection and no pool has been created after:', { term });
        }
        return c ? await c.query(term, opt) : await cpool.queue(term, opt);
    };
};
exports.expr = (arg) => {
    if (query_1.isQuery(arg)) {
        return arg;
    }
    return query_1.toQuery(param_parser_1.parseParam(arg));
};
const numToStringArr = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
function numToString(num) {
    return numToStringArr.map((_, i) => i).includes(num)
        ? numToStringArr[num]
        : num.toString();
}
