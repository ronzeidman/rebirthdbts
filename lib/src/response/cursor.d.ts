import { RebirthDBSocket } from '../connection/socket';
import { QueryJson } from '../internal-types';
import { Response } from '../proto/ql2';
import { RCursor, RunOptions } from '../types';
export declare class Cursor implements RCursor {
    private conn;
    private token;
    private runOptions;
    private query;
    private results;
    private hasNext;
    private position;
    private responseType?;
    private profile;
    constructor(conn: RebirthDBSocket, token: number, runOptions: Pick<RunOptions, 'binaryFormat' | 'groupFormat' | 'timeFormat'>, query: QueryJson, results?: any[] | undefined, hasNext?: boolean | undefined);
    close(): Promise<void>;
    next(): Promise<any>;
    toArray(): Promise<any[]>;
    eachAsync(rowHandler: (row: any) => Promise<void>): Promise<void>;
    resolve(): Promise<Response.ResponseType.SUCCESS_ATOM | Response.ResponseType.SUCCESS_SEQUENCE | Response.ResponseType.SUCCESS_PARTIAL>;
}
export declare function isCursor<T = any>(cursor: any): cursor is RCursor<T>;
