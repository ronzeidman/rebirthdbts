import { RebirthDBErrorType } from '..';
import { QueryJson, TermJson } from '../internal-types';
import { ErrorType, ResponseType } from '../proto/enums';
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
  public get type() { return this._type; }
  // tslint:disable-next-line:variable-name
  private _type: RebirthDBErrorType = RebirthDBErrorType.UNKNOWN_ERROR;
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
    this.name = 'RebirthDBError';
    this.msg = msg;
    this.term = query ? query[1] : term;
    this.backtrace = backtrace;
    this.setErrorType({ errorCode, type });
    Error.captureStackTrace(this, RebirthDBError);
  }

  private setErrorType({ errorCode, type }: { errorCode?: number, type?: RebirthDBErrorType }) {
    if (errorCode && errorCode >= 10 && errorCode <= 20) {
      this._type = RebirthDBErrorType.AUTH_ERROR;
    } else if (type) {
      this._type = type;
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
