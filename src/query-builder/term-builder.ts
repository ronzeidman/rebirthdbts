import { isUndefined } from 'util';
import { RebirthDBConnection } from '../connection/connection';
import { MasterConnectionPool } from '../connection/master-pool';
import { RebirthDBError } from '../error/error';
import { ComplexTermJson, TermJson } from '../internal-types';
import { TermType } from '../proto/enums';
import { RCursor, RunOptions } from '../types';
import { parseOptarg, parseParam } from './param-parser';
import { isQuery, toQuery } from './query';
import { TermConfig, funcall, termConfig } from './query-config';
import { r } from './r';

export function termBuilder(
  [termType, termName, minArgs, maxArgs, hasOptarg]: TermConfig,
  currentTerm?: TermJson
) {
  return (...args: any[]) => {
    let optarg: any;
    const params: TermJson[] = !isUndefined(currentTerm) ? [currentTerm] : [];
    if (isQuery(args[0]) && args[0].term[0] === TermType.ARGS) {
      params.push(parseParam(args[0]));
      optarg = hasOptarg ? args[1] : undefined;
    } else {
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
      const maybeOptarg = args.length ? args.pop() : undefined;
      optarg =
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
      if (!isUndefined(maybeOptarg) && isUndefined(optarg)) {
        args.push(maybeOptarg);
      }
      params.push(...args.map(parseParam));
    }
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
    const tb = termBuilder(funcall);
    return last ? tb(last, termQuery, ...args) : tb(termQuery);
  };
};

export const runQueryFunc = (term: TermJson) => {
  return async (
    conn?: RebirthDBConnection | RunOptions,
    options?: RunOptions
  ): Promise<any> => {
    const c = conn instanceof RebirthDBConnection ? conn : undefined;
    const cpool = r.getPoolMaster() as MasterConnectionPool;
    const opt = conn instanceof RebirthDBConnection ? options : conn;
    if (!c && !cpool) {
      throw new RebirthDBError(
        '`run` was called without a connection and no pool has been created after:',
        { term }
      );
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
export const getCursorQueryFunc = (term: TermJson) => {
  return async (
    conn?: RebirthDBConnection | RunOptions,
    options?: RunOptions
  ): Promise<RCursor | undefined> => {
    const c = conn instanceof RebirthDBConnection ? conn : undefined;
    const cpool = r.getPoolMaster() as MasterConnectionPool;
    const opt = conn instanceof RebirthDBConnection ? options : conn;
    if (!c && !cpool) {
      throw new RebirthDBError(
        '`getCursor` was called without a connection and no pool has been created after:',
        { term }
      );
    }
    return c ? await c.query(term, opt) : await cpool.queue(term, opt);
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
