import { RebirthDBErrorType } from '..';
import { QueryJson, TermJson } from '../internal-types';
import { ErrorType, ResponseType } from '../proto/enums';
export interface RebirthDBErrorArgs {
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
    readonly type: RebirthDBErrorType;
    private _type;
    private term?;
    private query?;
    private backtrace?;
    constructor(msg: string, {type, term, query, errorCode, backtrace, responseType, responseErrorType}?: RebirthDBErrorArgs);
    private setErrorType({errorCode, type});
}
