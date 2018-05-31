import { ErrorType, QueryType, ResponseNote, ResponseType, TermType } from './proto/enums';
export declare type TermJson = ComplexTermJson | string | number | boolean | object | null;
export declare type OptargsJson = {
    [key: string]: any;
} | undefined;
export interface ComplexTermJson extends Array<TermType | TermJson[] | OptargsJson> {
    0: TermType;
    1?: TermJson[];
    2?: OptargsJson;
}
export interface QueryJson extends Array<QueryType | TermJson | OptargsJson> {
    0: QueryType;
    1?: TermJson;
    2?: OptargsJson;
}
export interface ResponseJson {
    t: ResponseType;
    r: any[];
    n: ResponseNote[];
    e?: ErrorType;
    p?: any;
    b?: Array<number | string>;
}
