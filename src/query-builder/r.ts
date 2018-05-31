import { RebirthDBConnection } from '../connection/connection';
import { MasterConnectionPool } from '../connection/master-pool';
import { RebirthDBError } from '../error/error';
import { R, RConnectionOptions, RServerConnectionOptions } from '../types';
import { toQuery } from './query';
import { funcall, rConfig, rConsts, termConfig } from './query-config';
import { expr, termBuilder } from './term-builder';

export const r: R = expr as any;
(r as any).connect = async (options: RConnectionOptions = {}) => {
  const conOptions: RServerConnectionOptions[] = [];
  if ('host' in options || 'port' in options) {
    conOptions.push({ host: options.host, port: options.port });
  }
  if ('server' in options) {
    conOptions.push(options.server);
  }
  if ('servers' in options) {
    if (options.servers && !options.servers.length) {
      throw new RebirthDBError(
        'If `servers` is an array, it must contain at least one server.'
      );
    }
    conOptions.push(...options.servers);
  }
  if (!conOptions.length) {
    conOptions.push({});
  }
  if (options.pool === false) {
    const c = new RebirthDBConnection(conOptions[0], options as any);
    await c.reconnect();
    return c;
  }
  if ((r as any).pool) {
    ((r as any).pool as MasterConnectionPool).drain();
  }
  const cpool = new MasterConnectionPool({
    ...options,
    servers: conOptions
  } as any);
  cpool.initServers();
  await cpool.waitForHealthy();
  (r as any).pool = cpool;
};
(r as any).nextVarId = 1;
r.getPoolMaster = () => (r as any).pool;
r.expr = expr;
r.do = (...args: any[]) => {
  const last = args.pop();
  return termBuilder(funcall)(last, ...args);
};
rConfig.forEach(config => ((r as any)[config[1]] = termBuilder(config)));
rConsts.forEach(([type, name]) => ((r as any)[name] = toQuery(type)));
termConfig
  .filter(([_, name]) => !(name in r))
  .forEach(
    ([type, name, minArgs, maxArgs, optArgs]) =>
      ((r as any)[name] = termBuilder([
        type,
        name,
        minArgs + 1,
        maxArgs === -1 ? maxArgs : maxArgs + 1,
        optArgs
      ]))
  );
