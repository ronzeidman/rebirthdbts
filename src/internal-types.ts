import { Query, Response, Term } from './proto/ql2';

export type TermJson =
  | ComplexTermJson
  | string
  | number
  | boolean
  | object
  | null;
export type OptargsJson = { [key: string]: any } | undefined;
export interface ComplexTermJson
  extends Array<Term.TermType | TermJson[] | OptargsJson> {
  0: Term.TermType;
  1?: TermJson[];
  2?: OptargsJson;
}
export interface QueryJson
  extends Array<Query.QueryType | TermJson | OptargsJson> {
  0: Query.QueryType;
  1?: TermJson;
  2?: OptargsJson;
}
export interface ResponseJson {
  t: Response.ResponseType;
  r: any[];
  n: Response.ResponseNote[];
  p?: any;
  b?: any;
}
