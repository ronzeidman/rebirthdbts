/// <reference types="node" />
import { EventEmitter } from 'events';
import { RServerConnectionOptions } from '..';
import { QueryJson, ResponseJson } from '../internal-types';
export declare type RNConnOpts = RServerConnectionOptions & {
    host: string;
    port: number;
};
export declare class RebirthDBSocket extends EventEmitter {
    connectionOptions: RNConnOpts;
    readonly user: string;
    readonly password: Buffer;
    runningQueries: number[];
    lastError?: Error;
    readonly status: string;
    private isOpen;
    private socket?;
    private nextToken;
    private buffer;
    private mode;
    private data;
    private ca?;
    constructor({connectionOptions, user, password}: {
        connectionOptions: RNConnOpts;
        user?: string;
        password?: Buffer;
    });
    connect(): Promise<void>;
    sendQuery(query: QueryJson, token?: number): number;
    stopQuery(token: number): void;
    readNext<T = ResponseJson>(token: number, timeout?: number): Promise<T>;
    close(): void;
    private performHandshake();
    private handleHandshakeData();
    private handleData();
    private startQuery(token);
    private finishQuery(token);
    private setData(token, response?);
    private handleError(err);
}
export declare function setConnectionDefaults(connectionOptions: RServerConnectionOptions): RNConnOpts;
