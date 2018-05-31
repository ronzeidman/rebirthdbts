import { QueryJson, TermJson } from '../internal-types';
export declare function backtraceTerm(term?: TermJson, head?: boolean, backtrace?: Array<number | string>): [string, string];
export declare function backtraceQuery(query: QueryJson, backtrace?: number[]): [string] | [string, string];
