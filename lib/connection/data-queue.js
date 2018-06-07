"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataQueue {
    constructor() {
        this.queue = [];
        this.waiting = [];
    }
    enqueue(data, op) {
        if (this.waiting.length > 0) {
            const waiter = this.waiting.shift();
            if (waiter) {
                if (op) {
                    op();
                }
                waiter.resolve(data);
            }
        }
        else {
            this.queue.push({ data, op });
        }
    }
    destroy(data) {
        let waiter;
        while ((waiter = this.waiting.shift())) {
            waiter.resolve(data);
        }
    }
    async dequeue() {
        if (this.queue.length > 0) {
            const { data = null, op = null } = this.queue.shift() || {};
            if (op) {
                op();
            }
            if (data) {
                return data;
            }
        }
        let resolve;
        const promise = new Promise(r => {
            const index = this.waiting.length;
            resolve = (t) => {
                this.waiting.splice(index, 1);
                r(t);
            };
        });
        this.waiting.push({
            resolve,
            promise
        });
        return promise;
    }
}
exports.DataQueue = DataQueue;
