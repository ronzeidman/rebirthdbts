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

export function parseTerm(
  term?: TermJson,
  head = true,
  backtrace?: number[]
): [string, string] {
  const parseArg = (
    arg: TermJson,
    index: number,
    all?: any[],
    forceHead = false
  ) =>
    parseTerm(
      arg,
      forceHead || (!all && index === 0),
      nextBacktrace(index, backtrace)
    );
  if (typeof term === 'undefined') {
    return getMarked('');
  }
  if (!Array.isArray(term)) {
    let termStr = '';
    if (term === null) {
      termStr = 'null';
    } else if (typeof term === 'object') {
      termStr =
        '{ ' +
        Object.entries(term)
          .map(([key, val]) => `${key}: ${parseTerm(val, false)[0]}`)
          .join(', ') +
        ' }';
    } else if (typeof term === 'string') {
      termStr = `"${term}"`;
    } else {
      termStr = term.toString();
    }
    return getMarked(head ? `r.expr(${termStr})` : termStr, backtrace);
  }
  const [type, args, optarg] = term;
  switch (type) {
    case Term.TermType.MAKE_ARRAY: {
      if (!args) {
        return getMarked('');
      }
      return getMarked(
        head
          ? combineMarks`r.expr([${args
              .map(parseArg)
              .reduce(joinMultiArray, ['', ''])}])`
          : combineMarks`[${args
              .map(parseArg)
              .reduce(joinMultiArray, ['', ''])}]`,
        backtrace
      );
    }
    case Term.TermType.FUNC: {
      const paramsBacktrace = nextBacktrace(0, backtrace);
      const params = (args as any)[0][1].map((i: number) =>
        getMarked(`var${i}`, nextBacktrace(i, paramsBacktrace))
      );
      return getMarked(
        combineMarks`(${params.reduce(joinMultiArray, [
          '',
          ''
        ])}) => ${parseTerm(
          (args as any)[1],
          true,
          nextBacktrace(1, backtrace)
        )}`,
        backtrace
      );
    }
    case Term.TermType.VAR: {
      return getMarked(`var${(args as any)[0]}`, backtrace);
    }
    case Term.TermType.FUNCALL: {
      if (!args) {
        return getMarked('');
      }
      const [func, caller, ...params] = args;
      const parsedParams = params
        .map((a, i) => parseArg(a, i + 2))
        .reduce(joinMultiArray, ['', '']);
      return getMarked(
        parsedParams[0]
          ? combineMarks`${parseArg(
              caller,
              1,
              undefined,
              true
            )}.do(${parsedParams}, ${parseArg(func, 0)})`
          : combineMarks`${parseArg(caller, 1, undefined, true)}.do(${parseArg(
              func,
              0
            )})`,
        backtrace
      );
    }
    case Term.TermType.BRACKET: {
      if (!args) {
        return getMarked('');
      }
      const [caller, ...params] = args;
      if (Array.isArray(caller)) {
        const parsedParams = [...params, ...(optarg ? [optarg] : [])]
          .map((a, i) => parseArg(a, i + 1))
          .reduce(joinMultiArray, ['', '']);
        return getMarked(
          combineMarks`${parseArg(caller, 0)}(${parsedParams})`,
          backtrace
        );
      }
      return getMarked('');
    }
    default: {
      const c = rConsts.find(co => co[0] === type);
      if (c) {
        return getMarked(`r.${c[1]}`, backtrace);
      }
      const func = funcConfig.find(conf => conf[0] === type);
      if (!func) {
        return getMarked('');
      }
      if (!args) {
        return getMarked(
          combineMarks`r.${func[1]}(${parseTerm(optarg, false)})`,
          backtrace
        );
      }
      const [caller, ...params] = args;
      if (Array.isArray(caller)) {
        const parsedParams = [...params, ...(optarg ? [optarg] : [])]
          .map((a, i) => parseArg(a, i + 1))
          .reduce(joinMultiArray, ['', '']);
        return getMarked(
          combineMarks`${parseArg(caller, 0)}.${func[1]}(${parsedParams})`,
          backtrace
        );
      }
      const parsedArgs = [...args, ...(optarg ? [optarg] : [])]
        .map(parseArg)
        .reduce(joinMultiArray, ['', '']);
      return getMarked(combineMarks`r.${func[1]}(${parsedArgs})`, backtrace);
    }
  }
}

export function parseQuery(
  query: QueryJson,
  backtrace?: number[]
): [string] | [string, string] {
  const [type, term, optarg] = query;
  switch (type) {
    case Query.QueryType.START:
      return parseTerm(term, true); // `${parseTerm(term)}.run(${parseTerm(optarg, false)})`
    case Query.QueryType.SERVER_INFO:
      return ['conn.server()'];
    case Query.QueryType.NOREPLY_WAIT:
      return ['conn.noreplyWait()'];
    default:
      return [''];
  }
}

function nextBacktrace(i: number, backtrace?: number[]) {
  if (backtrace && backtrace[0] === i) {
    return backtrace.slice(1);
  }
}

function joinMultiArray(acc: string[], next: string[]): [string, string] {
  return acc[0]
    ? [`${acc[0]}, ${next[0]}`, `${acc[1]}  ${next[1]}`]
    : [next[0], next[1]];
}

function getMarked(
  str: string | [string, string],
  backtrace?: number[]
): [string, string] {
  const s = Array.isArray(str) ? str[0] : str;
  const emptyMarks = Array.isArray(str) ? str[1] : ' '.repeat(str.length);
  return backtrace && backtrace.length === 0
    ? [s, '^'.repeat(s.length)]
    : [s, emptyMarks];
}

function combineMarks(
  literals: TemplateStringsArray,
  ...placeholders: Array<string | string[]>
): [string, string] {
  let result = '';
  let mark = '';

  for (let i = 0; i < placeholders.length; i++) {
    result += literals[i];
    mark += ' '.repeat(literals[i].length);
    if (!Array.isArray(placeholders[i])) {
      result += placeholders[i];
      mark += ' '.repeat(placeholders[i].length);
    } else {
      result += placeholders[i][0];
      mark += placeholders[i][1];
    }
  }

  // add the last literal
  result += literals[literals.length - 1];
  mark += ' '.repeat(literals[literals.length - 1].length);
  return [result, mark];
}
