/// <reference types="node" />
import { EventEmitter } from 'events';
import { Socket } from 'net';
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
    lastError?: Error;
    readonly status: string;
    socket?: Socket;
    runningQueries: Map<number, {
        resolve: (data: Error | ResponseJson) => void;
        query: QueryJson;
        data: Promise<ResponseJson>;
    }>;
    private isOpen;
    private nextToken;
    private buffer;
    private mode;
    private ca?;
    constructor({connectionOptions, user, password}: {
        connectionOptions: RNConnOpts;
        user?: string;
        password?: Buffer;
    });
    eventNames(): string[];
    connect(): Promise<void>;
    sendQuery(query: QueryJson, token?: number): number;
    stopQuery(token: number): number;
    readNext<T = ResponseJson>(token: number): Promise<T>;
    close(): void;
    private performHandshake();
    private handleHandshakeData();
    private handleData();
    private handleError(err);
}
export declare function setConnectionDefaults(connectionOptions: RServerConnectionOptions): RNConnOpts;
