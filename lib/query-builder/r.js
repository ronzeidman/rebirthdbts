"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection/connection");
const master_pool_1 = require("../connection/master-pool");
const error_1 = require("../error/error");
const types_1 = require("../types");
const globals_1 = require("./globals");
const query_1 = require("./query");
const query_config_1 = require("./query-config");
const term_builder_1 = require("./term-builder");
exports.r = term_builder_1.expr;
exports.r.connectPool = async (options = {}) => {
    const { host, port, server = { host, port }, servers = [server] } = options, optsWithoutHostPort = __rest(options, ["host", "port", "server", "servers"]);
    if (host || port) {
        if (options.server) {
            throw new error_1.RebirthDBError('If `host` or `port` are defined `server` must not be.', { type: types_1.RebirthDBErrorType.API_FAIL });
        }
        else if (options.servers) {
            throw new error_1.RebirthDBError('If `host` or `port` are defined `servers` must not be.', { type: types_1.RebirthDBErrorType.API_FAIL });
        }
    }
    if (options.server && options.servers) {
        throw new error_1.RebirthDBError('If `server` is defined `servers` must not be.', {
            type: types_1.RebirthDBErrorType.API_FAIL
        });
    }
    if (!servers.length) {
        throw new error_1.RebirthDBError('If `servers` is an array, it must contain at least one server.', { type: types_1.RebirthDBErrorType.API_FAIL });
    }
    if (exports.r.pool) {
        exports.r.pool.removeAllListeners();
        exports.r.pool.drain();
    }
    const cpool = new master_pool_1.MasterConnectionPool(Object.assign({}, options, { servers }));
    exports.r.pool = cpool;
    cpool.initServers().catch(() => undefined);
    await cpool.waitForHealthy();
};
exports.r.connect = async (options = {}) => {
    const { host, port, server = { host, port } } = options, optsWithoutHostPort = __rest(options, ["host", "port", "server"]);
    if ((host || port) && options.server) {
        throw new error_1.RebirthDBError('If `host` or `port` are defined `server` must not be.', { type: types_1.RebirthDBErrorType.API_FAIL });
    }
    const c = new connection_1.RebirthDBConnection(server, options);
    await c.reconnect();
    return c;
};
exports.r.getPoolMaster = () => exports.r.pool;
exports.r.setNestingLevel = (level) => (globals_1.globals.nestingLevel = level);
exports.r.setArrayLimit = (limit) => (globals_1.globals.arrayLimit = limit);
exports.r.expr = term_builder_1.expr;
exports.r.do = (...args) => {
    const last = args.pop();
    return term_builder_1.termBuilder(query_config_1.funcall)(last, ...args);
};
query_config_1.rConfig.forEach(config => (exports.r[config[1]] = term_builder_1.termBuilder(config)));
query_config_1.rConsts.forEach(([type, name]) => (exports.r[name] = query_1.toQuery([type])));
query_config_1.termConfig
    .filter(([_, name]) => !(name in exports.r))
    .forEach(([type, name, minArgs, maxArgs, optArgs]) => (exports.r[name] = term_builder_1.termBuilder([
    type,
    name,
    minArgs + 1,
    maxArgs === -1 ? maxArgs : maxArgs + 1,
    optArgs
])));
