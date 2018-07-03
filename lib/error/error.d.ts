import { RebirthDBErrorType } from '..';
import { QueryJson, TermJson } from '../internal-types';
import { ErrorType, ResponseType } from '../proto/enums';
export interface RebirthDBErrorArgs {
    cause?: Error;
    type?: RebirthDBErrorType;
    errorCode?: number;
    term?: TermJson;
    query?: QueryJson;
    backtrace?: Array<number | string>;
    responseType?: ResponseType;
    responseErrorType?: ErrorType;
}
export declare function isRebirthDBError(error: any): error is RebirthDBError;
export declare class RebirthDBError extends Error {
    msg: string;
    readonly cause: Error | undefined;
    readonly type: RebirthDBErrorType;
    private _type;
    private term?;
    private query?;
    private backtrace?;
    constructor(msg: string, {cause, type, term, query, errorCode, backtrace, responseType, responseErrorType}?: RebirthDBErrorArgs);
    addBacktrace({term, query, backtrace}?: {
        term?: TermJson;
        query?: QueryJson;
        backtrace?: [string, string];
    }): void;
    private setErrorType({errorCode, type, responseErrorType});
}
