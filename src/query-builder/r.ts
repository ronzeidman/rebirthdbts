import { RebirthDBConnection } from '../connection/connection';
import { MasterConnectionPool } from '../connection/master-pool';
import { RebirthDBError } from '../error/error';
import {
  R,
  RConnectionOptions,
  RPoolConnectionOptions,
  RebirthDBErrorType
} from '../types';
import { globals } from './globals';
import { toQuery } from './query';
import { funcall, rConfig, rConsts, termConfig } from './query-config';
import { expr, termBuilder } from './term-builder';

export const r: R = expr as any;
(r as any).connectPool = async (options: RPoolConnectionOptions = {}) => {
  const {
    host,
    port,
    server = { host, port },
    servers = [server],
    ...optsWithoutHostPort
  } = options;
  if (host || port) {
    if ((options as any).server) {
      throw new RebirthDBError(
        'If `host` or `port` are defined `server` must not be.',
        { type: RebirthDBErrorType.API_FAIL }
      );
    } else if ((options as any).servers) {
      throw new RebirthDBError(
        'If `host` or `port` are defined `servers` must not be.',
        { type: RebirthDBErrorType.API_FAIL }
      );
    }
  }
  if ((options as any).server && (options as any).servers) {
    throw new RebirthDBError('If `server` is defined `servers` must not be.', {
      type: RebirthDBErrorType.API_FAIL
    });
  }
  if (!servers.length) {
    throw new RebirthDBError(
      'If `servers` is an array, it must contain at least one server.',
      { type: RebirthDBErrorType.API_FAIL }
    );
  }
  if ((r as any).pool) {
    ((r as any).pool as MasterConnectionPool).removeAllListeners();
    ((r as any).pool as MasterConnectionPool).drain();
  }
  const cpool = new MasterConnectionPool({
    ...options,
    servers
  } as any);
  (r as any).pool = cpool;
  cpool.initServers().catch(() => undefined);
  await cpool.waitForHealthy();
};

(r as any).connect = async (options: RConnectionOptions = {}) => {
  const {
    host,
    port,
    server = { host, port },
    ...optsWithoutHostPort
  } = options;
  if ((host || port) && (options as any).server) {
    throw new RebirthDBError(
      'If `host` or `port` are defined `server` must not be.',
      { type: RebirthDBErrorType.API_FAIL }
    );
  }
  const c = new RebirthDBConnection(server, options as any);
  await c.reconnect();
  return c;
};
(r as any).nextVarId = 1;
r.getPoolMaster = () => (r as any).pool;
r.setNestingLevel = (level: number) => (globals.nestingLevel = level);
r.setArrayLimit = (limit?: number) => (globals.arrayLimit = limit);
r.expr = expr;
r.do = (...args: any[]) => {
  const last = args.pop();
  return termBuilder(funcall)(last, ...args);
};
rConfig.forEach(config => ((r as any)[config[1]] = termBuilder(config)));
rConsts.forEach(([type, name]) => ((r as any)[name] = toQuery([type])));
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
