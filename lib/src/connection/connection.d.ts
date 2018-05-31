/// <reference types="node" />
import { EventEmitter } from 'events';
import { TermJson } from '../internal-types';
import { Connection, RunOptions, ServerInfo } from '../types';
export declare class RebirthDBConnection extends EventEmitter implements Connection {
    clientPort: number;
    clientAddress: string;
    private socket;
    private timeout;
    private pingInterval;
    private silent;
    private log;
    private pingTimer?;
    private db;
    constructor({host, port}?: {
        host?: string;
        port?: number;
    }, {db, user, password, timeout, pingInterval, silent, log}?: {
        db?: string;
        user?: string;
        password?: string;
        timeout?: number;
        pingInterval?: number;
        silent?: boolean;
        log?: (message: string) => undefined;
    });
    readonly isConnected: boolean;
    readonly numOfQueries: number;
    close({noreplyWait}?: {
        noreplyWait?: boolean;
    }): Promise<void>;
    reconnect(options?: {
        noreplyWait: boolean;
    }, {host, port}?: {
        host?: string;
        port?: number;
    }): Promise<this>;
    use(db: string): void;
    noreplyWait(): Promise<void>;
    server(): Promise<ServerInfo>;
    query(term: TermJson, globalArgs?: RunOptions): Promise<any>;
    private findTableTermAndAddDb(term, db);
    private startPinging();
    private stopPinging();
    private reportError(err);
}
