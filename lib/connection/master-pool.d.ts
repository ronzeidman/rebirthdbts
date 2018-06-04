/// <reference types="node" />
import { EventEmitter } from 'events';
import { TermJson } from '../internal-types';
import { Cursor } from '../response/cursor';
import { Connection, MasterPool, RPoolConnectionOptions, RunOptions } from '../types';
import { ServerConnectionPool } from './server-pool';
export declare class MasterConnectionPool extends EventEmitter implements MasterPool {
    private healthy;
    private discovery;
    private discoveryCursor?;
    private servers;
    private serverPools;
    private connParam;
    private timers;
    constructor({db, user, password, discovery, servers, buffer, max, timeout, pingInterval, timeoutError, timeoutGb, maxExponent, silent, log}?: RPoolConnectionOptions);
    setOptions({discovery, buffer, max, timeoutError, timeoutGb, maxExponent, silent, log}: {
        discovery?: boolean;
        buffer?: number | undefined;
        max?: number | undefined;
        timeoutError?: number | undefined;
        timeoutGb?: number | undefined;
        maxExponent?: number | undefined;
        silent?: boolean | undefined;
        log?: ((message: string) => any) | undefined;
    }): void;
    eventNames(): string[];
    initServers(serverNum?: number): Promise<void>;
    readonly isHealthy: boolean;
    waitForHealthy(): Promise<{}>;
    drain({noreplyWait}?: {
        noreplyWait?: boolean;
    }): Promise<void>;
    getPools(): ServerConnectionPool[];
    getConnections(): Connection[];
    getLength(): number;
    getAvailableLength(): number;
    queue(term: TermJson, globalArgs?: RunOptions): Promise<Cursor | undefined>;
    private createServerPool(server);
    private setServerPoolsOptions(params);
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
