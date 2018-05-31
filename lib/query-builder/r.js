"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../connection/connection");
const master_pool_1 = require("../connection/master-pool");
const error_1 = require("../error/error");
const query_1 = require("./query");
const query_config_1 = require("./query-config");
const term_builder_1 = require("./term-builder");
exports.r = term_builder_1.expr;
exports.r.connect = async (options = {}) => {
    const conOptions = [];
    if ('host' in options || 'port' in options) {
        conOptions.push({ host: options.host, port: options.port });
    }
    if ('server' in options) {
        conOptions.push(options.server);
    }
    if ('servers' in options) {
        if (options.servers && !options.servers.length) {
            throw new error_1.RebirthDBError('If `servers` is an array, it must contain at least one server.');
        }
        conOptions.push(...options.servers);
    }
    if (!conOptions.length) {
        conOptions.push({});
    }
    if (options.pool === false) {
        const c = new connection_1.RebirthDBConnection(conOptions[0], options);
        await c.reconnect();
        return c;
    }
    if (exports.r.pool) {
        exports.r.pool.drain();
    }
    const cpool = new master_pool_1.MasterConnectionPool(Object.assign({}, options, { servers: conOptions }));
    cpool.initServers();
    await cpool.waitForHealthy();
    exports.r.pool = cpool;
};
exports.r.nextVarId = 1;
exports.r.getPoolMaster = () => exports.r.pool;
exports.r.expr = term_builder_1.expr;
exports.r.do = (...args) => {
    const last = args.pop();
    return term_builder_1.termBuilder(query_config_1.funcall)(last, ...args);
};
query_config_1.rConfig.forEach(config => (exports.r[config[1]] = term_builder_1.termBuilder(config)));
query_config_1.rConsts.forEach(([type, name]) => (exports.r[name] = query_1.toQuery(type)));
query_config_1.termConfig
    .filter(([_, name]) => !(name in exports.r))
    .forEach(([type, name, minArgs, maxArgs, optArgs]) => (exports.r[name] = term_builder_1.termBuilder([
    type,
    name,
    minArgs + 1,
    maxArgs === -1 ? maxArgs : maxArgs + 1,
    optArgs
])));
