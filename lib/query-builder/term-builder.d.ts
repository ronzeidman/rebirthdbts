import { RebirthDBConnection } from '../connection/connection';
import { TermJson } from '../internal-types';
import { RCursor, RunOptions } from '../types';
import { TermConfig } from './query-config';
export declare function termBuilder([termType, termName, minArgs, maxArgs, hasOptarg]: TermConfig, currentTerm?: TermJson): (...args: any[]) => any;
export declare const doTermFunc: (termQuery: any) => (...args: any[]) => any;
export declare const runQueryFunc: (term: TermJson) => (conn?: RunOptions | RebirthDBConnection | undefined, options?: RunOptions | undefined) => Promise<any>;
export declare const getCursorQueryFunc: (term: TermJson) => (conn?: RunOptions | RebirthDBConnection | undefined, options?: RunOptions | undefined) => Promise<RCursor<any> | undefined>;
export declare const expr: (arg: any, nestingLevel?: number) => any;
