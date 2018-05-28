import { funcConfig, rConsts } from './config';
import { RebirthDBConnection } from './connection';
import { QueryJson, TermJson } from './internal-types';
import { Query, Term } from './proto/ql2';
import { parseParam } from './query-builder';

export function parseOptarg(obj: object) {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelToSnake(key)]: parseParam(value)
    }),
    {}
  );
}

export function camelToSnake(name: string) {
  return name.replace(/([A-Z])/g, x => `_${x.toLowerCase()}`);
}

export function count(acc: number, next: any) {
  return acc + 1;
}

export function min(acc: RebirthDBConnection, next: RebirthDBConnection) {
  return acc.getSocket().runningQueries <= next.getSocket().runningQueries
    ? acc
    : next;
}

export function parseTerm(term?: TermJson, head = true): string {
  if (typeof term === 'undefined') {
    return '';
  }
  if (!Array.isArray(term)) {
    let termStr = '';
    if (term === null) {
      termStr = 'null';
    } else if (typeof term === 'object') {
      termStr =
        '{ ' +
        Object.entries(term)
          .map(([key, val]) => `${key}: ${parseTerm(val)}`)
          .join(', ') +
        ' }';
    } else if (typeof term === 'string') {
      termStr = `"${term}"`;
    } else {
      termStr = term.toString();
    }
    return head ? `r.expr(${termStr})` : termStr;
  }
  const [type, args, optarg] = term;
  switch (type) {
    case Term.TermType.MAKE_ARRAY: {
      if (!args) {
        return '';
      }
      return head
        ? `r.expr(${args.map(a => parseTerm(a)).join(', ')})`
        : '[' + args.map(a => parseTerm(a)).join(', ') + ']';
    }
    case Term.TermType.FUNC: {
      const params = (args as any)[0][1].map((i: number) => `var${i}`);
      return `(${params.join(', ')}) => ${parseTerm(args as any)[1]}`;
    }
    case Term.TermType.VAR: {
      return `var${(args as any)[0]}`;
    }
    case Term.TermType.FUNCALL: {
      if (!args) {
        return '';
      }
      const [func, caller, ...params] = args;
      const parsedParams = params.map(a => parseTerm(a, false)).join(', ');
      return `${parseTerm(caller)}.do(${parsedParams}, ${parseTerm(func)})`;
    }
    default: {
      const c = rConsts.find(co => co[0] === type);
      if (c) {
        return `r.${c[1]}`;
      }
      const func = funcConfig.find(conf => conf[0] === type);
      if (!func) {
        return '';
      }
      if (!args) {
        return `r.${func[1]}(${parseTerm(optarg, false)})`;
      }
      const [caller, ...params] = args;
      if (Array.isArray(caller) && caller[0] !== Term.TermType.MAKE_ARRAY) {
        const parsedParams = [...params, ...(optarg ? [optarg] : [])]
          .map(a => parseTerm(a, false))
          .join(', ');
        return `${parseTerm(caller)}.${func[1]}(${parsedParams})`;
      }
      const parsedArgs = [...args, ...(optarg ? [optarg] : [])]
        .map(a => parseTerm(a, false))
        .join(', ');
      return `r.${func[1]}(${parsedArgs})`;
    }
  }
}

export function parseQuery(query: QueryJson, showRun = false): string {
  const [type, term, optarg] = query;
  switch (type) {
    case Query.QueryType.START:
      return showRun
        ? `${parseTerm(term)}.run(${parseTerm(optarg)})`
        : parseTerm(term);
    case Query.QueryType.SERVER_INFO:
      return 'conn.server()';
    case Query.QueryType.NOREPLY_WAIT:
      return 'conn.noreplyWait()';
    default:
      return '';
  }
}
