import { parseTerm } from './helper';
import { QueryJson, TermJson } from './internal-types';
import { Response } from './proto/ql2';

export interface RebirthDBErrorArgs {
  errorCode?: number;
  term?: TermJson;
  query?: QueryJson;
  backtrace?: number[];
  responseType?: Response.ResponseType;
  responseErrorType?: Response.ErrorType;
}
export class RebirthDBError extends Error {
  public errorCode?: number;
  private term?: TermJson;
  private query?: QueryJson;
  private backtrace?: number[];

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
  backtrace?: number[]
) {
  const t = query ? query[1] : term;
  if (t) {
    msg = msg.substring(0, msg.length - 1) + ' in:';
    const [str, mark] = parseTerm(t, true, backtrace);
    msg += `\n${str}`;
    if (backtrace) {
      msg += `\n${mark}\n`;
    }
  }
  return msg;
}
