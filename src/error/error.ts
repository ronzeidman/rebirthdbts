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
    this.name = 'ReqlError';
    this.msg = msg;
    this.term = query ? query[1] : term;
    this.backtrace = backtrace;
    this.setErrorType({ errorCode, type, responseErrorType });
    Error.captureStackTrace(this, RebirthDBError);
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
