import { isBuffer, isDate, isFunction } from 'util';
import { funcConfig, rConsts } from './config';
import { RebirthDBConnection } from './connection';
import { RebirthDBConnectionPool } from './connection-pool';
import { RebirthDBError } from './error';
import { parseOptarg } from './helper';
import { ComplexTermJson, TermJson } from './internal-types';
import { Term } from './proto/ql2';
import { ConnectionOptions, R, RunOptions } from './types';

const reversedDo = queryTermBuilder(Term.TermType.FUNCALL, 1, -1, false);
const rSymbol = Symbol('r');
const isQueryBuilder = (arg: any) =>
  (typeof arg === 'object' || typeof arg === 'function') && rSymbol in arg;
const queryBuilderProto = Object.assign(
  funcConfig
    .map(([termType, funcName, minArg, maxArg, hasOptarg]) => ({
      [funcName]: queryTermBuilder(termType, minArg, maxArg, hasOptarg)
    }))
    .reduce((acc, next) => ({ ...acc, ...next })),
  {
    [rSymbol]: true,
    do(this: { term?: TermJson }, ...args: any[]) {
      const last = args.pop();
      if (this.term) {
        args.unshift(this);
      }
      return reversedDo.call({}, last, ...args);
    },
    async run(
      this: { term: TermJson },
      conn?: RebirthDBConnection | RunOptions,
      options?: RunOptions
    ) {
      const c = conn instanceof RebirthDBConnection ? conn : undefined;
      const cpool = r.getPoolMaster() as RebirthDBConnectionPool;
      const opt = conn instanceof RebirthDBConnection ? options : conn;
      if (!c && !cpool) {
        throw new RebirthDBError(
          '`run` was called without a connection and no pool has been created after:',
          { term: this.term }
        );
      }
      if (c) {
        return await c.query(this.term, opt);
      }
      return await cpool.queue(this.term, opt);
    }
  }
);
// this may cause a performance issue, but this is how it's done in rethinkdbdash to support bracket operation
function getQueryBuilder(term?: TermJson) {
  const qb: any = term
    ? queryTermBuilder(Term.TermType.BRACKET, 1, 1, false, term)
    : expr;
  qb.__proto__ = queryBuilderProto;
  qb.term = term;
  return qb;
}

function expr(arg: any) {
  if (isQueryBuilder(arg)) {
    return arg;
  }
  if (Array.isArray(arg)) {
    return getQueryBuilder(parseParam(arg));
  }
  return getQueryBuilder(arg);
}

export function parseParam(param: any): TermJson {
  if (isQueryBuilder(param)) {
    if (!param.term) {
      throw new RebirthDBError("'r' cannot be an argument");
    }
    return param.term;
  }
  if (Array.isArray(param)) {
    return [Term.TermType.MAKE_ARRAY, param.map(p => parseParam(p))];
  }
  if (isDate(param)) {
    return {
      $reql_type$: 'TIME',
      epochTime: param.getTime(),
      timezone: '+00:00'
    };
  }
  if (isBuffer(param)) {
    return {
      $reql_type$: 'BINARY',
      data: param.toString('base64')
    };
  }
  if (isFunction(param)) {
    return [
      Term.TermType.FUNC,
      [
        [
          Term.TermType.MAKE_ARRAY,
          Array(param.length)
            .fill(0)
            .map((_, i) => i + 1)
        ],
        parseParam(
          param(
            ...Array(param.length)
              .fill(0)
              .map((_, i) => getQueryBuilder([Term.TermType.VAR, [i + 1]]))
          )
        )
      ]
    ];
  }
  if (typeof param === 'object') {
    return Object.entries(param).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: parseParam(value) }),
      {}
    );
  }
  return param;
}

export function queryTermBuilder(
  termType: Term.TermType,
  minArgs: number,
  maxArgs: number,
  hasOptarg: boolean,
  t?: TermJson
) {
  return function(this: { term?: TermJson }, ...args: any[]) {
    const currentTerm: TermJson | undefined = (t || (this && this.term)) as any;
    const argsLength = args.length;
    let localMaxArgs = maxArgs;
    if (!currentTerm) {
      localMaxArgs++;
    }
    const maxArgsPlusOptarg =
      hasOptarg && localMaxArgs >= 0 ? localMaxArgs + 1 : localMaxArgs;
    if (minArgs === maxArgsPlusOptarg && argsLength !== minArgs) {
      const termConf = funcConfig.find(c => c[0] === termType);
      throw new RebirthDBError(
        `\`${termConf ? termConf[1] : termType}\` takes ${minArgs} argument${
          minArgs === 1 ? '' : 's'
        }, ${argsLength} provided after:`,
        { term: currentTerm }
      );
    }
    if (argsLength < minArgs) {
      const termConf = funcConfig.find(c => c[0] === termType);
      throw new RebirthDBError(
        `\`${
          termConf ? termConf[1] : termType
        }\` takes at least ${minArgs} argument${
          minArgs === 1 ? '' : 's'
        }, ${argsLength} provided after:`,
        { term: currentTerm }
      );
    }
    if (maxArgs !== -1 && argsLength > maxArgsPlusOptarg) {
      const termConf = funcConfig.find(c => c[0] === termType);
      throw new RebirthDBError(
        `\`${
          termConf ? termConf[1] : termType
        }\` takes at most ${maxArgsPlusOptarg} argument${
          maxArgsPlusOptarg === 1 ? '' : 's'
        }, ${argsLength} provided after:`,
        { term: currentTerm }
      );
    }
    const params: TermJson[] = currentTerm ? [currentTerm] : [];
    const maybeOptarg = args.length ? args.pop() : undefined;
    const optarg =
      hasOptarg &&
      ((maxArgsPlusOptarg > 0 && argsLength >= maxArgsPlusOptarg) ||
        (argsLength > minArgs &&
          !Array.isArray(maybeOptarg) &&
          typeof maybeOptarg === 'object' &&
          !(rSymbol in maybeOptarg)))
        ? maybeOptarg
        : undefined;
    if (maybeOptarg && !optarg) {
      args.push(maybeOptarg);
    }
    params.push(...args.map(parseParam));
    const term: ComplexTermJson = [termType];
    if (params.length > 0) {
      term[1] = params;
    }
    if (optarg) {
      term[2] = parseOptarg(maybeOptarg);
    }
    return getQueryBuilder(term);
  };
}

export const r: R = Object.assign(
  getQueryBuilder() as any,
  rConsts.reduce(
    (acc, [term, key]) => ({
      ...acc,
      [key]: { [rSymbol]: true, term: [term] }
    }),
    {}
  ),
  {
    expr,
    connect: async ({ pool = true, ...options }: ConnectionOptions = {}) => {
      if (options.servers && !options.servers.length) {
        throw new RebirthDBError(
          'If `servers` is an array, it must contain at least one server.'
        );
      }
      if (!pool) {
        const c = new RebirthDBConnection(
          options.servers && options.servers.length
            ? options.servers[0]
            : ({} as any),
          options as any
        );
        await c.reconnect();
        return c;
      }
      const cpool = new RebirthDBConnectionPool(options);
      await cpool.waitForHealthy();
      (r as any).pool = cpool;
    },
    getPoolMaster: () => {
      return (r as any).pool;
    }
  }
);
