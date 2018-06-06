import { TermType } from '../proto/enums';
export declare type TermConfig = [TermType, string, number, number, 'required' | 'optional' | 'last' | 'last-optional' | false];
export declare const bracket: TermConfig;
export declare const funcall: TermConfig;
export declare const termConfig: TermConfig[];
export declare const rConfig: TermConfig[];
export declare const rConsts: Array<[TermType, string]>;
