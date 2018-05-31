import { Term } from '../proto/ql2';
export declare type TermConfig = [Term.TermType, string, number, number, boolean];
export declare const bracket: TermConfig;
export declare const funcall: TermConfig;
export declare const termConfig: TermConfig[];
export declare const rConfig: TermConfig[];
export declare const rConsts: Array<[Term.TermType, string]>;
