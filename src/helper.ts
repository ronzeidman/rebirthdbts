import { RebirthDBConnection } from './connection';

export function camelToSnake(name: string) {
  return name.replace(/([A-Z])/g, x => `_${x.toLowerCase()}`);
}

export function count(acc: number, next: any) {
  return acc + 1;
}

export function min(acc: RebirthDBConnection, next: RebirthDBConnection) {
  return acc.getSocket().runningQueries <= next.getSocket().runningQueries
    ? acc
    : next;
}
