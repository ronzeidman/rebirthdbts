import { QueryJson, TermJson } from '../internal-types';
import { Response } from '../proto/ql2';
import { backtraceTerm } from './term-backtrace';

export interface RebirthDBErrorArgs {
  errorCode?: number;
  term?: TermJson;
  query?: QueryJson;
  backtrace?: Array<number | string>;
  responseType?: Response.ResponseType;
  responseErrorType?: Response.ErrorType;
}

export function isRebirthDBError(error: any) {
  return error instanceof RebirthDBError;
}

export class RebirthDBError extends Error {
  public errorCode?: number;
  private term?: TermJson;
  private query?: QueryJson;
  private backtrace?: Array<number | string>;

  constructor(
    public msg: string,
    {
      term,
      query,
      errorCode,
      backtrace,
      responseType,
      responseErrorType
    }: RebirthDBErrorArgs = {}
  ) {
    super(buildMessage(msg, query, term, backtrace));
    this.name = 'RebirthDBError';
    this.msg = msg;
    this.term = query ? query[1] : term;
    this.errorCode = errorCode;
    this.backtrace = backtrace;
    Error.captureStackTrace(this, RebirthDBError);
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
      msg.charAt(msg.length - 1) === '.'
        ? msg.substring(0, msg.length - 1) + ' in:'
        : msg;
    const [str, mark] = backtraceTerm(t, true, backtrace);
    msg += `\n${str}`;
    if (backtrace) {
      msg += `\n${mark}\n`;
    }
  }
  return msg;
}
