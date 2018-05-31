import { RebirthDBConnection } from '../connection/connection';
import { MasterConnectionPool } from '../connection/master-pool';
import { RebirthDBError } from '../error/error';
import { ComplexTermJson, TermJson } from '../internal-types';
import { RunOptions } from '../types';
import { parseOptarg, parseParam } from './param-parser';
import { isQuery, toQuery } from './query';
import { TermConfig, funcall, termConfig } from './query-config';
import { r } from './r';

export function termBuilder(
  [termType, termName, minArgs, maxArgs, hasOptarg]: TermConfig,
  currentTerm?: TermJson
) {
  return (...args: any[]) => {
    const argsLength = args.length;
    const maxArgsPlusOptarg = hasOptarg && maxArgs >= 0 ? maxArgs + 1 : maxArgs;
    if (minArgs === maxArgsPlusOptarg && argsLength !== minArgs) {
      throw new RebirthDBError(
        `\`${
          !currentTerm ? `r.${termName}` : termName
        }\` takes ${minArgs} argument${
          minArgs === 1 ? '' : 's'
        }, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`,
        { term: currentTerm }
      );
    }
    if (argsLength < minArgs) {
      const termConf = termConfig.find(c => c[0] === termType);
      throw new RebirthDBError(
        `\`${
          !currentTerm ? `r.${termName}` : termName
        }\` takes at least ${minArgs} argument${
          minArgs === 1 ? '' : 's'
        }, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`,
        { term: currentTerm }
      );
    }
    if (maxArgs !== -1 && argsLength > maxArgsPlusOptarg) {
      throw new RebirthDBError(
        `\`${
          !currentTerm ? `r.${termName}` : termName
        }\` takes at most ${maxArgsPlusOptarg} argument${
          maxArgsPlusOptarg === 1 ? '' : 's'
        }, ${argsLength} provided${!currentTerm ? '.' : ' after:'}`,
        { term: currentTerm }
      );
    }
    const params: TermJson[] = currentTerm ? [currentTerm] : [];
    const maybeOptarg = args.length ? args.pop() : undefined;
    const optarg =
      hasOptarg &&
      (((maxArgsPlusOptarg > 0 && argsLength >= maxArgsPlusOptarg) ||
        argsLength > minArgs) &&
        (!Array.isArray(maybeOptarg) &&
          typeof maybeOptarg === 'object' &&
          !isQuery(maybeOptarg)))
        ? maybeOptarg
        : undefined;
    if (hasOptarg && argsLength === maxArgsPlusOptarg && !optarg) {
      throw new RebirthDBError(
        `${numToString(
          argsLength
        )} argument of \`${termName}\` must be an object.`,
        { term: currentTerm }
      );
    }
    if (maybeOptarg && !optarg) {
      args.push(maybeOptarg);
    }
    params.push(...args.map(parseParam));
    const term: ComplexTermJson = [termType];
    if (params.length > 0) {
      term[1] = params;
    }
    if (optarg) {
      term[2] = parseOptarg(optarg) as any;
    }
    return toQuery(term);
  };
}

export const doTermFunc = (termQuery: any) => {
  return (...args: any[]) => {
    const last = args.pop();
    return termBuilder(funcall)(last, termQuery, ...args);
  };
};

export const runQueryFunc = (term: TermJson) => {
  return async (
    conn?: RebirthDBConnection | RunOptions,
    options?: RunOptions
  ) => {
    const c = conn instanceof RebirthDBConnection ? conn : undefined;
    const cpool = r.getPoolMaster() as MasterConnectionPool;
    const opt = conn instanceof RebirthDBConnection ? options : conn;
    if (!c && !cpool) {
      throw new RebirthDBError(
        '`run` was called without a connection and no pool has been created after:',
        { term }
      );
    }
    if (c) {
      return await c.query(term, opt);
    }
    return await cpool.queue(term, opt);
  };
};

export const expr = (arg: any) => {
  if (isQuery(arg)) {
    return arg;
  }
  return toQuery(parseParam(arg));
};

const numToStringArr = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
function numToString(num: number) {
  return numToStringArr.map((_, i) => i).includes(num)
    ? numToStringArr[num]
    : num.toString();
}
