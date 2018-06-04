import { Readable } from 'stream';
import { isUndefined } from 'util';
import { RebirthDBSocket } from '../connection/socket';
import { RebirthDBError, isRebirthDBError } from '../error/error';
import { QueryJson, ResponseJson } from '../internal-types';
import { QueryType, ResponseNote, ResponseType } from '../proto/enums';
import { RCursor, RCursorType, RebirthDBErrorType, RunOptions } from '../types';
import { getNativeTypes } from './response-parser';

export class Cursor extends Readable implements RCursor {
  public get profile() {
    return this._profile;
  }
  // tslint:disable-next-line:variable-name
  private _profile: any;
  private position = 0;
  private type: RCursorType = 'Cursor';
  private includeStates = false;
  private closed = false;
  private emitting = false;
  constructor(
    private conn: RebirthDBSocket,
    private token: number,
    private runOptions: Pick<
      RunOptions,
      'binaryFormat' | 'groupFormat' | 'timeFormat'
    >,
    private query: QueryJson,
    private results?: any[],
    private hasNextBatch?: boolean
  ) {
    super({ objectMode: true });
  }
  public _read() {
    if (this.closed) {
      this.push(null);
      this.emitting = false;
    }
    this.emitting = true;
    const push = (row: any): any =>
      row === null
        ? this._next().then(push)
        : this.closed
          ? null
          : this.push(row);
    this._next()
      .then(push)
      .catch(err => {
        if (
          isRebirthDBError(err) &&
          err.type === RebirthDBErrorType.CURSOR_END
        ) {
          this.push(null);
          this.emitting = false;
        } else {
          this.emit('error', err);
        }
      });
  }

  public pause() {
    this.emitting = false;
    return super.pause();
  }

  public resume() {
    this._read();
    return super.resume();
  }

  public _destroy() {
    this.close();
  }

  public toString() {
    return `[object ${this.type}]`;
  }

  public getType() {
    return this.type;
  }

  public async close() {
    this.conn.stopQuery(this.token);
    this.emitting = false;
    this.closed = true;
  }

  public async next(timeout = -1) {
    if (this.emitting) {
      throw new RebirthDBError(
        'You cannot call `next` once you have bound listeners on the Feed.',
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    if (this.closed) {
      throw new RebirthDBError(
        `You cannot call \`next\` on a closed ${this.type}`,
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    return await this._next(timeout);
  }

  public async toArray() {
    if (this.emitting) {
      throw new RebirthDBError(
        'You cannot call `toArray` once you have bound listeners on the Feed.',
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    const all: any[] = [];
    if (!this.results) {
      await this.resolve();
      if (this.results && this.type === 'Atom') {
        const [result] = this.results;
        if (Array.isArray(result)) {
          return result;
        }
        return [result];
      }
    }
    return this.eachAsync(async row => all.push(row)).then(() => all);
  }

  public async each(
    callback: (err: RebirthDBError | undefined, row?: any) => boolean,
    onFinishedCallback?: () => any
  ) {
    if (this.emitting) {
      throw new RebirthDBError(
        'You cannot call `each` once you have bound listeners on the Feed.',
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    if (this.closed) {
      callback(
        new RebirthDBError(
          'You cannot retrieve data from a cursor that is closed',
          { type: RebirthDBErrorType.CURSOR }
        )
      );
      if (onFinishedCallback) {
        onFinishedCallback();
      }
      return;
    }
    let resume = true;
    let err: RebirthDBError | undefined;
    let next: any;
    while (resume !== false && !this.closed) {
      err = undefined;
      try {
        next = await this.next();
      } catch (error) {
        err = error;
      }
      if (err && err.type === RebirthDBErrorType.CURSOR_END) {
        break;
      }
      resume = callback(err, next);
    }
    if (onFinishedCallback) {
      onFinishedCallback();
    }
  }

  public async eachAsync(
    rowHandler: (row: any, rowFinished?: (error?: string) => any) => any,
    final?: (error: any) => any
  ) {
    if (this.emitting) {
      throw new RebirthDBError(
        'You cannot call `eachAsync` once you have bound listeners on the Feed.',
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    if (this.closed) {
      throw new RebirthDBError(
        'You cannot retrieve data from a cursor that is closed',
        { type: RebirthDBErrorType.CURSOR }
      );
    }
    let nextRow: any;
    try {
      while (!this.closed) {
        nextRow = await this.next();
        if (rowHandler.length > 1) {
          await new Promise((resolve, reject) => {
            rowHandler(
              nextRow,
              err =>
                err
                  ? reject(
                      new RebirthDBError(err, { type: RebirthDBErrorType.USER })
                    )
                  : resolve()
            );
          });
        } else {
          const result = rowHandler(nextRow);
          if (result !== undefined && !isPromise(result)) {
            throw result;
          }
          await result;
        }
      }
    } catch (error) {
      if (final) {
        try {
          await final(error);
          return;
        } catch (err) {
          error = err;
        }
      }
      if (
        !isRebirthDBError(error) ||
        error.type !== RebirthDBErrorType.CURSOR_END
      ) {
        throw error;
      }
    }
  }

  public async resolve(timeout = -1) {
    const response = await this.conn.readNext(this.token, timeout);
    const { n: notes, t: type, r: results, p: profile } = response;
    this._profile = profile;
    this.position = 0;
    this.results = getNativeTypes(results, this.runOptions);
    this.handleResponseNotes(type, notes);
    this.handleErrors(response);
    this.hasNextBatch =
      this.type.endsWith('Feed') || type === ResponseType.SUCCESS_PARTIAL;
    return this.results;
  }

  private async _next(timeout = -1) {
    let results = this.getResults();
    while (
      isUndefined(results) ||
      (this.hasNextBatch && isUndefined(results[this.position]))
    ) {
      if (results) {
        this.conn.sendQuery([QueryType.CONTINUE], this.token);
      }
      await this.resolve(timeout);
      results = this.getResults();
    }
    if (isUndefined(results) || isUndefined(results[this.position])) {
      this.close();
      throw new RebirthDBError('No more rows in the cursor.', {
        type: RebirthDBErrorType.CURSOR_END
      });
    }
    return results[this.position++];
  }

  private getResults() {
    return this.results &&
      this.type === 'Atom' &&
      Array.isArray(this.results[0])
      ? this.results[0]
      : this.results;
  }

  private handleErrors(response: ResponseJson) {
    const { t: type, b: backtrace, r: results, e: error } = response;
    switch (type) {
      case ResponseType.CLIENT_ERROR:
      case ResponseType.COMPILE_ERROR:
      case ResponseType.RUNTIME_ERROR:
        throw new RebirthDBError(results[0], {
          responseErrorType: error,
          responseType: type,
          query: this.query,
          backtrace
        });
      case ResponseType.SUCCESS_ATOM:
      case ResponseType.SUCCESS_PARTIAL:
      case ResponseType.SUCCESS_SEQUENCE:
        break;
      default:
        throw new RebirthDBError('Unexpected return value');
    }
  }

  private handleResponseNotes(rType: ResponseType, notes: ResponseNote[] = []) {
    if (rType === ResponseType.SUCCESS_ATOM) {
      this.includeStates = false;
      this.type = 'Atom';
      return;
    }
    const { type, includeStates } = notes.reduce(
      (acc, next) => {
        switch (next) {
          case ResponseNote.SEQUENCE_FEED:
            acc.type = 'Feed';
            break;
          case ResponseNote.ATOM_FEED:
            acc.type = 'AtomFeed';
            break;
          case ResponseNote.ORDER_BY_LIMIT_FEED:
            acc.type = 'OrderByLimitFeed';
            break;
          case ResponseNote.UNIONED_FEED:
            acc.type = 'UnionedFeed';
            break;
          case ResponseNote.INCLUDES_STATES:
            acc.includeStates = true;
        }
        return acc;
      },
      { type: 'Cursor' as RCursorType, includeStates: true }
    );
    this.type = type;
    this.includeStates = includeStates;
  }
}

export function isCursor<T = any>(cursor: any): cursor is RCursor<T> {
  return cursor instanceof Cursor;
}
function isPromise(obj: any): obj is Promise<any> {
  return (
    obj !== null && typeof obj === 'object' && typeof obj.then === 'function'
  );
}
