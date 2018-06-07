export declare class DataQueue<T> {
    private queue;
    private waiting;
    enqueue(data: T, op?: () => void): void;
    destroy(data: T): void;
    dequeue(): Promise<T>;
}
