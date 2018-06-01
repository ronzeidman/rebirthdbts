/// <reference types="node" />
import { EventEmitter } from 'events';
import { TermJson } from '../internal-types';
import { Connection, MasterPool, RPoolConnectionOptions, RunOptions } from '../types';
import { ServerConnectionPool } from './server-pool';
export declare class MasterConnectionPool extends EventEmitter implements MasterPool {
    private healthy;
    private buffer;
    private max;
    private timeoutError;
    private timeoutGb;
    private maxExponent;
    private silent;
    private discovery;
    private discoveryCursor?;
    private log;
    private servers;
    private serverPools;
    private connParam;
    private timers;
    constructor({db, user, password, discovery, servers, buffer, max, timeout, pingInterval, timeoutError, timeoutGb, maxExponent, silent, log}?: RPoolConnectionOptions);
    eventNames(): string[];
    initServers(serverNum?: number): Promise<void>;
    readonly isHealthy: boolean;
    waitForHealthy(): Promise<{}>;
    updateBufferMax({buffer, max}: {
        buffer: number;
        max: number;
    }): void;
    drain({noreplyWait}?: {
        noreplyWait?: boolean;
    }): Promise<void>;
    getPools(): ServerConnectionPool[];
    getConnections(): Connection[];
    getLength(): number;
    getAvailableLength(): number;
    queue(term: TermJson, globalArgs?: RunOptions): Promise<any>;
    private createServerPool(server);
    private rebalanceServerPools();
    private discover();
    private getServerFromStatus(status);
    private removeServer(server);
    private subscribeToPool(pool);
    private setHealthy(healthy);
    private closeServerPool(pool);
    private getHealthyServerPools();
    private getPoolWithMinQueries();
    private getOpenConnections();
    private getIdleConnections();
}
