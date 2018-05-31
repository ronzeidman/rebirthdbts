/// <reference types="node" />
import { EventEmitter } from 'events';
import { SocketConnectOpts } from 'net';
import { QueryJson, ResponseJson } from '../internal-types';
export declare class RebirthDBSocket extends EventEmitter {
    port: number;
    host: string;
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
    constructor({port, host, user, password}?: {
        port?: number;
        host?: string;
        user?: string;
        password?: Buffer;
    });
    connect(options?: Partial<SocketConnectOpts>, {host, port}?: {
        host?: string;
        port?: number;
    }): Promise<void>;
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
