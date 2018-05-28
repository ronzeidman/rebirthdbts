import { parseQuery, parseTerm } from './helper';
import { QueryJson, TermJson } from './internal-types';

export interface RebirthdbErrorArgs {
  errorCode?: number;
  term?: TermJson;
  query?: QueryJson;
}
export class RebirthdbError extends Error {
  public errorCode?: number;
  private term?: TermJson;
  private query?: QueryJson;

  constructor(
    public msg: string,
    { term, query, errorCode }: RebirthdbErrorArgs = {}
  ) {
    super(
      term
        ? `${msg}\n${parseTerm(term)}`
        : query
          ? `${msg}\n${parseQuery(query)}`
          : msg
    );
    this.name = 'RebirthdbError';
    this.term = term;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, RebirthdbError);
  }
}
