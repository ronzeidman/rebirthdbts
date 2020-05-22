import { isBuffer, isDate, isFunction, isObject, isUndefined } from 'util';
import { RethinkDBErrorType } from '..';
import { RethinkDBError } from '../error/error';
import { TermJson } from '../internal-types';
import { TermType } from '../proto/enums';
import { globals } from './globals';
import { isQuery, toQuery } from './query';

export function parseParam(
  param: any,
  nestingLevel = globals.nestingLevel,
): TermJson {
  if (nestingLevel === 0) {
    throw new RethinkDBError(
      'Nesting depth limit exceeded.\nYou probably have a circular reference somewhere.',
      { type: RethinkDBErrorType.PARSE },
    );
  }
  if (param === null) {
    return null;
  }
  if (isQuery(param)) {
    if (isUndefined(param.term)) {
      throw new RethinkDBError("'r' cannot be an argument", {
        type: RethinkDBErrorType.PARSE,
      });
    }
    if (
      globals.nextVarId === 1 &&
      nestingLevel === globals.nestingLevel &&
      hasImplicitVar(param.term)
    ) {
      return [TermType.FUNC, [[TermType.MAKE_ARRAY, [1]], param.term]];
    }
    return param.term;
  }
  if (Array.isArray(param)) {
    const arrTerm = [
      TermType.MAKE_ARRAY,
      param.map((p) => parseParam(p, nestingLevel - 1)),
    ];
    return hasImplicitVar(arrTerm)
      ? [TermType.FUNC, [[TermType.MAKE_ARRAY, [1]], arrTerm]]
      : arrTerm;
  }
  if (isDate(param)) {
    return {
      $reql_type$: 'TIME',
      epoch_time: param.getTime() / 1000,
      timezone: '+00:00',
    };
  }
  if (isBuffer(param)) {
    return {
      $reql_type$: 'BINARY',
      data: param.toString('base64'),
    };
  }
  if (isFunction(param)) {
    const { nextVarId } = globals;
    globals.nextVarId = nextVarId + param.length;
    try {
      const funcResult = param(
        ...Array(param.length)
          .fill(0)
          .map((_, i) => toQuery([TermType.VAR, [i + nextVarId]])),
      );
      if (isUndefined(funcResult)) {
        throw new RethinkDBError(
          `Anonymous function returned \`undefined\`. Did you forget a \`return\`? in:\n${param.toString()}`,
          { type: RethinkDBErrorType.PARSE },
        );
      }
      const term = [
        TermType.FUNC,
        [
          [
            TermType.MAKE_ARRAY,
            Array(param.length)
              .fill(0)
              .map((_, i) => i + nextVarId),
          ],
          parseParam(funcResult),
        ],
      ];
      return term;
    } finally {
      globals.nextVarId = nextVarId;
    }
  }
  if (typeof param === 'object') {
    const objTerm = Object.entries(param).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: parseParam(value, nestingLevel - 1),
      }),
      {},
    );
    return hasImplicitVar(objTerm)
      ? [TermType.FUNC, [[TermType.MAKE_ARRAY, [1]], objTerm]]
      : objTerm;
  }
  if (typeof param === 'number' && (isNaN(param) || !isFinite(param))) {
    throw new RethinkDBError(`Cannot convert \`${param}\` to JSON`, {
      type: RethinkDBErrorType.PARSE,
    });
  }
  return param;
}

export function parseOptarg(obj?: any) {
  if (!isObject(obj) || Array.isArray(obj)) {
    return undefined;
  }
  return Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelToSnake(key)]: parseParam(value),
    }),
    {},
  );
}

export function hasImplicitVar(term: TermJson | undefined): boolean {
  if (!Array.isArray(term)) {
    if (term !== null && typeof term === 'object') {
      return Object.values(term).some((value) => hasImplicitVar(value));
    }
    return false;
  }
  if (term[0] === TermType.IMPLICIT_VAR) {
    return true;
  }
  const termParam = term[1];
  if (termParam) {
    return termParam.some((value) => hasImplicitVar(value));
  }
  return false;
}

function camelToSnake(name: string) {
  return name.replace(/([A-Z])/g, (x) => `_${x.toLowerCase()}`);
}
