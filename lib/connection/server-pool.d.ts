/// <reference types="node" />
import { EventEmitter } from 'events';
import { TermJson } from '../internal-types';
import { ConnectionOptions, ConnectionPool, RServer, RunOptions } from '../types';
import { RebirthDBConnection } from './connection';
export declare class ServerConnectionPool extends EventEmitter implements ConnectionPool {
    readonly server: RServer;
    private healthy;
    private buffer;
    private max;
    private timeoutError;
    private timeoutGb;
    private maxExponent;
    private silent;
    private log;
    private connParam;
    private connections;
    private timers;
    constructor({host, port}?: {
        host?: string;
        port?: number;
    }, {db, user, password, buffer, max, timeout, pingInterval, timeoutError, timeoutGb, maxExponent, silent, log}?: ConnectionOptions);
    initConnections(): Promise<void>;
    readonly isHealthy: boolean;
    waitForHealthy(): Promise<{}>;
    updateBufferMax({buffer, max}: {
        buffer: number;
        max: number;
    }): void;
    drain({noreplyWait}?: {
        noreplyWait?: boolean;
    }, emit?: boolean): Promise<void>;
    getConnections(): RebirthDBConnection[];
    getLength(): number;
    getAvailableLength(): number;
    getNumOfRunningQueries(): number;
    queue(term: TermJson, globalArgs?: RunOptions): Promise<any>;
    private setHealthy(healthy);
    private createConnection();
    private subscribeToConnection(conn);
    private closeConnection(conn);
    private checkIdle(conn);
    private removeIdleTimer(conn);
    private persistConnection(conn);
    private reportError(err);
    private getOpenConnections();
    private getIdleConnections();
}
