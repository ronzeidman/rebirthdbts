import { RebirthDBErrorType } from '..';
import { QueryJson, TermJson } from '../internal-types';
import { ErrorType, ResponseType } from '../proto/enums';
import { globals } from '../query-builder/globals';
import { backtraceTerm } from './term-backtrace';

export interface RebirthDBErrorArgs {
  type?: RebirthDBErrorType;
  errorCode?: number;
  term?: TermJson;
  query?: QueryJson;
  backtrace?: Array<number | string>;
  responseType?: ResponseType;
  responseErrorType?: ErrorType;
}

export function isRebirthDBError(error: any): error is RebirthDBError {
  return error instanceof RebirthDBError;
}

export class RebirthDBError extends Error {
  public get type() {
    return this._type;
  }
  // tslint:disable-next-line:variable-name
  private _type: RebirthDBErrorType = RebirthDBErrorType.UNKNOWN;
  private term?: TermJson;
  private query?: QueryJson;
  private backtrace?: Array<number | string>;

  constructor(
    public msg: string,
    {
      type,
      term,
      query,
      errorCode,
      backtrace,
      responseType,
      responseErrorType
    }: RebirthDBErrorArgs = {}
  ) {
    super(buildMessage(msg, query, term, backtrace));
    this.name = 'ReqlDriverError';
    this.msg = msg;
    this.term = query ? query[1] : term;
    this.backtrace = backtrace;
    this.setErrorType({ errorCode, type, responseErrorType });
    Error.captureStackTrace(this, RebirthDBError);
  }

  public addBacktrace({
    term,
    query,
    backtrace
  }: {
    term?: TermJson;
    query?: QueryJson;
    backtrace?: [string, string];
  } = {}) {
    this.message = buildMessage(this.msg, query, term, backtrace);
  }

  private setErrorType({
    errorCode,
    type,
    responseErrorType
  }: {
    errorCode?: number;
    type?: RebirthDBErrorType;
    responseErrorType?: ErrorType;
  }) {
    if (type) {
      this.name = 'ReqlDriverError';
      this._type = type;
    } else if (errorCode && errorCode >= 10 && errorCode <= 20) {
      // https://rethinkdb.com/docs/writing-drivers/
      // A ReqlAuthError should be thrown if the error code is between 10 and 20 (inclusive)
      // what about other error codes?
      this.name = 'ReqlAuthError';
      this._type = RebirthDBErrorType.AUTH;
    } else if (responseErrorType) {
      switch (responseErrorType) {
        case ErrorType.INTERNAL:
          this.name = 'ReqlInternalError';
          this._type = RebirthDBErrorType.INTERNAL;
          break;
        case ErrorType.NON_EXISTENCE:
          this.name = 'ReqlNonExistanceError';
          this._type = RebirthDBErrorType.NON_EXISTENCE;
          break;
        case ErrorType.OP_FAILED:
          this.name = 'ReqlOpFailedError';
          this._type = RebirthDBErrorType.OP_FAILED;
          break;
        case ErrorType.OP_INDETERMINATE:
          this.name = 'ReqlOpIndeterminateError';
          this._type = RebirthDBErrorType.OP_INDETERMINATE;
          break;
        case ErrorType.PERMISSION_ERROR:
          this.name = 'ReqlPermissionError';
          this._type = RebirthDBErrorType.PERMISSION_ERROR;
          break;
        case ErrorType.QUERY_LOGIC:
          this.name = 'ReqlLogicError';
          this._type = RebirthDBErrorType.QUERY_LOGIC;
          break;
        case ErrorType.RESOURCE_LIMIT:
          this.name = 'ReqlResourceError';
          this._type = RebirthDBErrorType.RESOURCE_LIMIT;
          break;
        case ErrorType.USER:
          this.name = 'ReqlUserError';
          this._type = RebirthDBErrorType.USER;
          break;
      }
    } else {
      this.name = 'ReqlUnknownError';
    }
  }
}

function buildMessage(
  msg: string,
  query?: QueryJson,
  term?: TermJson,
  backtrace?: Array<number | string>
) {
  const t = query ? query[1] : term;
  if (t) {
    msg =
      msg.charAt(msg.length - 1) === ':'
        ? msg
        : msg.charAt(msg.length - 1) === '.'
          ? msg.substring(0, msg.length - 1) + ' in:'
          : msg + ' in:';
    const [str, mark] = backtraceTerm(t, true, backtrace);
    if (globals.pretty) {
      msg += `\n${pretty(str, mark)}`;
    } else {
      msg += `\n${str}\n`;
      if (backtrace) {
        msg += `${mark}\n`;
      }
    }
  }
  return msg;
}

function pretty(query: string, mark: string) {
  let result = '';
  let indent = 0;
  const openIndentPos: number[] = [];
  let char = '';
  let newline = true;
  let inStr = false;
  let eacape = false;
  let lastNewlinePos = 0;
  let lineMarkPos = 0;
  let lineMark = '';
  let nextSign = '';
  let isLastIndentDot = false;
  const openBrackets: string[] = [];
  for (let i = 0; i < query.length; i++) {
    char = query.charAt(i);
    if (!inStr) {
      if (['{', '(', '['].includes(char)) {
        openBrackets.unshift(char);
      } else if (
        (char === '}' && openBrackets[0] === '{') ||
        (char === ')' && openBrackets[0] === '(') ||
        (char === ']' && openBrackets[0] === '[')
      ) {
        openBrackets.shift();
      }
    }
    switch (char) {
      case '.':
        eacape = false;
        newline = false;
        if (inStr || result.length - lastNewlinePos <= 80 + indent) {
          result += char;
        } else {
          if (!isLastIndentDot) {
            indent += 4;
          }
          lineMark += mark.substring(lineMarkPos, i);
          lineMarkPos = i + 1;
          result = result.trimRight();
          nextSign =
            lineMark.charAt(result.length - lastNewlinePos) || mark.charAt(i);
          lineMark = lineMark.substring(0, result.length - lastNewlinePos);
          result += lineMark.includes('^')
            ? `\n${lineMark}\n${' '.repeat(indent)}.`
            : `\n${' '.repeat(indent)}.`;
          lastNewlinePos = result.length - indent - 1;
          lineMark = ' '.repeat(indent) + nextSign;
          isLastIndentDot = true;
        }
        break;
      case ',':
        if (inStr || openBrackets[0] !== '{') {
          newline = false;
          result += char;
        } else {
          newline = true;
          lineMark += mark.substring(lineMarkPos, i + 1);
          lineMarkPos = i + 1;
          result += lineMark.includes('^')
            ? `,\n${lineMark}\n${' '.repeat(indent)}`
            : `,\n${' '.repeat(indent)}`;
          lastNewlinePos = result.length - indent;
          lineMark = ' '.repeat(indent);
        }
        break;
      case '{':
        eacape = false;
        if (inStr || query.charAt(i + 1) === '}') {
          newline = false;
          result += char;
        } else {
          newline = true;
          openIndentPos.push(indent);
          isLastIndentDot = false;
          indent += 4;
          lineMark += mark.substring(lineMarkPos, i + 1);
          lineMarkPos = i + 1;
          result += lineMark.includes('^')
            ? `{\n${lineMark}\n${' '.repeat(indent)}`
            : `{\n${' '.repeat(indent)}`;
          lastNewlinePos = result.length - indent;
          lineMark = ' '.repeat(indent);
        }
        break;
      case '}':
        newline = false;
        eacape = false;
        if (inStr || query.charAt(i - 1) === '{') {
          result += char;
        } else {
          indent = openIndentPos.pop() || 0;
          lineMark += mark.substring(lineMarkPos, i);
          lineMarkPos = i + 1;
          result = result.trimRight();
          nextSign =
            lineMark.charAt(result.length - lastNewlinePos) || mark.charAt(i);
          lineMark = lineMark.substring(0, result.length - lastNewlinePos);
          result += lineMark.includes('^')
            ? `\n${lineMark}\n${' '.repeat(indent)}}`
            : `\n${' '.repeat(indent)}}`;
          lastNewlinePos = result.length - indent - 1;
          lineMark = ' '.repeat(indent) + nextSign;
        }
        break;
      case ' ':
        eacape = false;
        if (newline) {
          lineMarkPos++;
        } else {
          result += char;
        }
        break;
      case '"':
        if (escape) {
          eacape = false;
        } else {
          inStr = !inStr;
        }
        newline = false;
        result += char;
        break;
      case '\\':
        eacape = !escape;
        newline = false;
        result += char;
        break;
      default:
        eacape = false;
        newline = false;
        result += char;
        break;
    }
  }
  lineMark += mark.substring(lineMarkPos, query.length);
  result = result.trimRight();
  lineMark = lineMark.substring(0, result.length - lastNewlinePos);
  result += lineMark.includes('^') ? `\n${lineMark}\n` : '\n';
  return result;
}
