import { isBuffer, isDate, isFunction } from 'util';
import { RebirthDBError } from '../error/error';
import { TermJson } from '../internal-types';
import { Term } from '../proto/ql2';
import { isQuery, toQuery } from './query';
import { r } from './r';

export function parseParam(param: any): TermJson {
  if (param === null) {
    return null;
  }
  if (isQuery(param)) {
    if (typeof param.term === 'undefined') {
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
    const { nextVarId } = r as any;
    (r as any).nextVarId = nextVarId + param.length;
    const term = [
      Term.TermType.FUNC,
      [
        [
          Term.TermType.MAKE_ARRAY,
          Array(param.length)
            .fill(0)
            .map((_, i) => i + nextVarId)
        ],
        parseParam(
          param(
            ...Array(param.length)
              .fill(0)
              .map((_, i) => toQuery([Term.TermType.VAR, [i + 1]]))
          )
        )
      ]
    ];
    (r as any).nextVarId = nextVarId;
    return term;
  }
  if (typeof param === 'object') {
    return Object.entries(param).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: parseParam(value) }),
      {}
    );
  }
  return param;
}

export function parseOptarg(obj: object) {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelToSnake(key)]: parseParam(value)
    }),
    {}
  );
}

function camelToSnake(name: string) {
  return name.replace(/([A-Z])/g, x => `_${x.toLowerCase()}`);
}
