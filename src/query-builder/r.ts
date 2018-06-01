import { RebirthDBConnection } from '../connection/connection';
import { MasterConnectionPool } from '../connection/master-pool';
import { RebirthDBError } from '../error/error';
import { R, RConnectionOptions, RPoolConnectionOptions } from '../types';
import { toQuery } from './query';
import { funcall, rConfig, rConsts, termConfig } from './query-config';
import { expr, termBuilder } from './term-builder';

export const r: R = expr as any;
(r as any).connectPool = async (options: RPoolConnectionOptions = {}) => {
  const { servers = [{}], ...opts } = options;
  if (!servers.length) {
    throw new RebirthDBError(
      'If `servers` is an array, it must contain at least one server.'
    );
  }
  if ((r as any).pool) {
    ((r as any).pool as MasterConnectionPool).drain();
  }
  const cpool = new MasterConnectionPool({
    ...options,
    servers
  } as any);
  cpool.initServers();
  await cpool.waitForHealthy();
  (r as any).pool = cpool;
};

(r as any).connect = async (options: RConnectionOptions = {}) => {
  const { host, port, server = { host, port }, ...optsWithoutHostPort } = options;
  if ((host || port) && (options as any).server) {
    throw new RebirthDBError(
      'If `host` or `port` are defined `server` must not be.'
    );
  }
  const c = new RebirthDBConnection(server, options as any);
  await c.reconnect();
  return c;
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
