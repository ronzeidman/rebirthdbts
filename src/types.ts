import { EventEmitter } from 'events';

//#region optargs
export type Format = 'native' | 'raw';
export type Durability = 'hard' | 'soft';

type Omit<T, K extends keyof T> = T extends any
  ? Pick<T, Exclude<keyof T, K>>
  : never;
export interface ServerInfo {
  id: string;
  name: string;
  proxy: boolean;
}
export interface ConnectionOptions {
  db?: string; // default 'test'
  user?: string; // default 'admin'
  password?: string; // default ''
  discovery?: boolean; // default false
  pool?: boolean; // default true
  buffer?: number; // default = number of servers
  max?: number; // default = number of servers
  timeout?: number; // default = 20
  pingInterval?: number; // default -1
  timeoutError?: number; // default = 1000
  timeoutGb?: number; // default = 60*60*1000
  maxExponent?: number; // default 6
  silent?: boolean; // default = false
  servers?: Array<{
    host: string;
    port?: number; // default 28015
  }>; // default [{host: 'localhost', port: 28015}]
  log?: (message: string) => any; // default undefined;
}

export interface TableCreateOptions {
  primaryKey?: string; // default: "id"
  shards?: number; // 1-32
  replicas?: number | { [serverTag: string]: number };
  primaryReplicaTag?: string;
  nonvotingReplicaTags?: string[];
  durability?: Durability; // "soft" or "hard" defualt: "hard"
}
export interface Repair {
  emergencyRepair: 'unsafe_rollback' | 'unsafe_rollback_or_erase';
}
export interface TableReconfigureOptions {
  shards?: number; // 1-32
  replicas?: number | { [serverTag: string]: number };
  primaryReplicaTag?: string;
  dryRun?: boolean;
}

export interface TableOptions {
  readMode?: 'single' | 'majority' | 'outdated'; // "single" "majority" "outdated"
  identifierFormat?: 'name' | 'uuid'; // "name" "uuid";
}

export interface DeleteOptions {
  returnChanges?: boolean | string | 'always'; // true, false or "always" default: false
  durability?: Durability; // "soft" or "hard" defualt: table
}

export interface InsertOptions extends DeleteOptions {
  conflict?:
    | 'error'
    | 'replace'
    | 'update'
    | ((id: RDatum, oldDoc: RDatum, newDoc: RDatum) => RDatum | object);
}

export interface UpdateOptions extends DeleteOptions {
  nonAtomic?: boolean;
}

export interface IndexOptions {
  multi?: boolean;
  geo?: boolean;
}

export interface RunOptions {
  timeFormat?: Format; // 'native' or 'raw', default 'native'
  groupFormat?: Format; // 'native' or 'raw', default 'native'
  binaryFormat?: Format; // 'native' or 'raw', default 'native'
  useOutdated?: boolean; // default false
  profile?: boolean; // default false
  durability?: Durability; // 'hard' or 'soft'
  noreply?: boolean; // default false
  db?: string;
  arrayLimit?: number; // default 100,000
  minBatchRows?: number; // default 8
  maxBatchRow?: number; // default unlimited
  maxBatchBytes?: number; // default 1MB
  maxBatchSeconds?: number; // default 0.5
  firstBatchScaledownFactor?: number; // default 4
  immidiateReturn?: boolean;
}

export interface HttpRequestOptions {
  // General
  timeout?: number; // default 30
  reattempts?: number; // default 5
  redirects?: number; // default 1
  verify?: boolean; // default true
  resultFormat: 'text' | 'json' | 'jsonp' | 'binary' | 'auto';

  // Request Options
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'; // "GET" "POST" "PUT" "PATCH" "DELETE" "HEAD"
  params?: object;
  header?: { [key: string]: string | object };
  data?: object;
}

export interface HTTPStreamRequestOptions extends HttpRequestOptions {
  // Pagination
  page:
    | 'link-next'
    | ((
        param: RDatum<{ params: any; header: any; body: any }>
      ) => RValue<string>);
  pageLimit: number; // -1 = no limit.
}

export interface WaitOptions {
  waitFor?:
    | 'ready_for_outdated_reads'
    | 'ready_for_reads'
    | 'ready_for_writes'
    | 'all_replicas_ready';
  timeout?: number;
}

export interface ChangesOptions {
  squash?: boolean | number;
  changefeedQueueSize?: number;
  includeInitial?: boolean;
  includeStates?: boolean;
  includeTypes?: boolean;
  includeOffsets?: boolean;
}
//#endregion optargs

//#region results
export interface ValueChange<T = any> {
  old_val?: T;
  new_val?: T;
}
export interface DBConfig {
  id: string;
  name: string;
}
export interface DBChangeResult {
  config_changes: Array<ValueChange<DBConfig>>;
  tables_dropped: number;
  dbs_created: number;
  dbs_dropped: number;
}
export interface RebalanceResult {
  reconfigured: number;
  config_changes: Array<ValueChange<TableConfig>>;
  status_changes: Array<ValueChange<TableStatus>>;
}
export interface ReconfigureResult {
  rebalanced: number;
  status_changes: Array<ValueChange<TableConfig>>;
}
export interface TableChangeResult {
  tablesCreated?: number;
  tablesDropped?: number;
  configChanges: ValueChange<TableConfig>;
}

export interface TableShard {
  primary_replica: string;
  replicas: string[];
  nonvoting_replicas: string[];
}

export interface TableConfig {
  id: string;
  name: string;
  db: string;
  primary_key: string; // default: "id"
  shards: TableShard[];
  indexes: string[];
  write_acks: string;
  durability: Durability; // "soft" or "hard" defualt: "hard"
}
export interface TableStatus {
  id: string;
  name: string;
  db: string;
  status: {
    all_replicas_ready: boolean;
    ready_for_outdated_reads: boolean;
    ready_for_reads: boolean;
    ready_for_writes: boolean;
  };
  shards: TableShard[];
}
export interface IndexStatus {
  function: Buffer;
  geo: boolean;
  index: string;
  multi: boolean;
  outdated: boolean;
  ready: boolean;
}
export interface WriteResult<T = any> {
  deleted: number;
  skipped: number;
  errors: number;
  first_error?: string;
  inserted: number;
  replaced: number;
  unchanged: number;
  generated_keys?: string[];
  warnings?: string[];
  changes?: Array<ValueChange<T>>;
}
export interface Changes<T = any> extends ValueChange<T> {
  state?: 'initializing' | 'ready'; // 'initializing', 'ready'. cant come together with values
  type?: 'change' | 'add' | 'remove' | 'initial' | 'uninitial' | 'state';
  old_offset?: number;
  new_offset?: number;
}

export interface JoinResult<T1 = any, T2 = any> {
  left: T1;
  right: T2;
}

export interface GroupResults<TGroupBy = any, TReduction = any> {
  group: TGroupBy;
  reduction: TReduction;
}

export interface MatchResults {
  start: number;
  end: number;
  str: string;
  groups: Array<{
    start: number;
    end: number;
    str: string;
  }>;
}

//#endregion results

//#region operations
export interface Connection extends EventEmitter {
  clientPort: number;
  clientAddress: string;
  close(options?: { noreplyWait: boolean }): Promise<void>;
  reconnect(options?: { noreplyWait: boolean }): Promise<void>;
  use(db: string): void;
  noreplyWait(): Promise<void>;
  server(): Promise<ServerInfo>;
}

export interface ConnectionPool extends EventEmitter {
  drain(options?: { noreplyWait: boolean }): Promise<void>;
  getLength(): number;
  getAvailableLength(): number;
  getPools(): Connection[];
}

export type RValue<T = any> = RDatum<T> | T;

export interface RCursor<T = any> {
  next(): Promise<T>;
  toArray(): Promise<T[]>;
  close(): Promise<void>;
  eachAsync(rowHandler: (row: T) => Promise<void>): Promise<void>;
}

export interface RQuery<T = any> {
  typeOf(): RDatum<string>;
  info(): RDatum<{
    value?: string;
    db?: { id: string; name: string; type: string };
    doc_count_estimates?: number[];
    id?: string;
    indexes?: string[];
    name?: string;
    primary_key?: string;
    type: string;
  }>;

  run(
    connection: Connection,
    noptions: RunOptions & { immidiateReturn: true }
  ): T extends RCursor<any> ? Promise<T> : Promise<RCursor<T>>;
  run(
    options: RunOptions & { immidiateReturn: true }
  ): T extends RCursor<any> ? Promise<T> : Promise<RCursor<T>>;
  run(
    connection: Connection,
    noptions?: RunOptions & { immidiateReturn?: false }
  ): Promise<T>;
  run(options?: RunOptions & { immidiateReturn?: false }): Promise<T>;
}
export interface RDatum<T = any> extends RQuery<T> {
  do<U>(
    ...args: Array<RDatum | Array<(arg: RDatum<T>, ...args: RStream[]) => U>>
  ): U extends RStream ? RStream : RDatum;
  <U extends T extends Array<infer T1> ? keyof T1 : keyof T>(
    attribute: RValue<U>
  ): T extends Array<infer T1> ? RDatum<Array<T[U]>> : RDatum<T[U]>;
  (attribute: RValue<number>): T extends Array<infer T1> ? RDatum<T1> : never;
  getField<U extends keyof T>(attribute: RValue<U>): RDatum<T[U]>;
  nth(
    attribute: RValue<number>
  ): T extends Array<infer T1> ? RDatum<T1> : never;
  default(value: T): RDatum<T>;
  hasFields(
    ...fields: string[]
  ): T extends Array<infer T1> ? RDatum<T> : RDatum<boolean>;
  // Works only if T is an array
  append<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never;
  prepend<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never;
  difference<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never;
  setInsert<U>(value: RValue<U>): T extends U[] ? RDatum<T> : never;
  setUnion<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never;
  setIntersection<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never;
  setDifference<U>(value: RValue<U[]>): T extends U[] ? RDatum<T> : never;
  insertAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never;
  changeAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never;
  spliceAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never;
  deleteAt<U>(
    index: RValue<number>,
    value: RValue<U>
  ): T extends U[] ? RDatum<T> : never;
  union<U = T extends Array<infer T1> ? T1 : never>(
    ...other: Array<RStream<U> | RValue<U[]> | { interleave: boolean | string }>
  ): T extends any[] ? RDatum<U[]> : never;
  map<Res = any, U = T extends Array<infer T1> ? T1 : never>(
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => any)>
  ): T extends any[] ? RDatum<Res[]> : never;
  concatMap<Res = any, U = T extends Array<infer T1> ? T1 : never>(
    ...args: Array<RStream | ((arg: RDatum<U>, ...args: RDatum[]) => any)>
  ): T extends any[] ? RDatum<Res[]> : never;
  forEach<U = any, ONE = T extends Array<infer T1> ? T1 : never>(
    func: (res: RDatum<ONE>) => RDatum<WriteResult<U>>
  ): T extends any[] ? RDatum<WriteResult<U>> : never;

  withFields(
    ...fields: Array<RValue<string>>
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never;
  filter<U = T extends Array<infer T1> ? T1 : never>(
    predicate: (doc: RDatum<U>) => RValue<boolean>,
    options?: { default: boolean }
  ): this;
  includes(geometry: RDatum): T extends Array<infer T1> ? RDatum<T> : never;
  intersects(geometry: RDatum): T extends Array<infer T1> ? RDatum<T> : never;

  // LOGIC
  contains(value: any): T extends Array<infer T1> ? RDatum<boolean> : never; // also predicate

  // ORDER BY
  orderBy<U = T extends Array<infer T1> ? T1 : never>(
    ...fields: Array<RValue<keyof U>>
  ): T extends Array<infer T1> ? RDatum<T> : never;

  // GROUP
  ungroup(): RDatum<Array<GroupResults<any, any>>>;

  // SELECT FUNCTIONS
  count<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | ((doc: RDatum<U>) => RValue<boolean>)
  ): T extends Array<infer T1> ? RDatum<number> : never;
  sum<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | ((doc: RDatum<U>) => RValue<number | null>)
  ): T extends Array<infer T1> ? RDatum<number> : never;
  avg<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | ((doc: RDatum<U>) => RValue<number | null>)
  ): T extends Array<infer T1> ? RDatum<number> : never;
  min<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | ((doc: RDatum<U>) => RValue<number | null>)
  ): T extends Array<infer T1> ? RDatum<number> : never;
  max<U = T extends Array<infer T1> ? T1 : never>(
    value?: RValue<U> | ((doc: RDatum<U>) => RValue<number | null>)
  ): T extends Array<infer T1> ? RDatum<number> : never;
  reduce<U = any, ONE = T extends Array<infer T1> ? T1 : never>(
    reduceFunction: (left: RDatum<ONE>, right: RDatum<ONE>) => any
  ): T extends Array<infer T1> ? RDatum<U> : never;
  fold<ACC = any, RES = any, ONE = T extends Array<infer T1> ? T1 : never>(
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<ONE>) => any, // this any is ACC
    options?: {
      emit?: (
        acc: RDatum<ACC>,
        next: RDatum<ONE>,
        // tslint:disable-next-line:variable-name
        new_acc: RDatum<ACC>
      ) => any[]; // this any is RES
      finalEmit?: (acc: RStream) => any[]; // this any is also RES
    }
  ): T extends Array<infer T1> ? RDatum<RES[]> : never;
  // SELECT
  distinct(): RDatum<T>;

  pluck(
    ...fields: any[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never;

  without(
    ...fields: any[]
  ): T extends Array<infer T1> ? RDatum<Array<Partial<T1>>> : never;

  merge<U = any>(
    ...objects: any[]
  ): T extends Array<infer T1> ? RDatum<U[]> : RDatum<U>;

  skip(n: RValue<number>): T extends Array<infer T1> ? RDatum<T> : never;
  limit(n: RValue<number>): T extends Array<infer T1> ? RDatum<T> : never;
  slice(
    start: RValue<number>,
    end?: RValue<number>,
    options?: { leftBound: 'open' | 'closed'; rightBound: 'open' | 'closed' }
  ): T extends Array<infer T1> ? RDatum<T> : never;
  sample(n: RValue<number>): T extends Array<infer T1> ? RDatum<T> : never;
  offsetsOf<U = T extends Array<infer T1> ? T1 : never>(
    single: RValue<U> | ((doc: RDatum<U>) => RValue<boolean>)
  ): T extends Array<infer T1> ? RDatum<number[]> : never;

  isEmpty(): T extends Array<infer T1> ? RDatum<boolean> : never;

  coerceTo<U = any>(
    type: 'object'
  ): T extends Array<infer T1> ? RDatum<U> : never;
  coerceTo(type: 'string'): RDatum<string>;
  coerceTo(type: 'array'): RDatum<any[]>;
  // Works only if T is a string
  coerceTo(type: 'number'): T extends string ? RDatum<number> : never;
  coerceTo(type: 'binary'): T extends string ? RDatum<Buffer> : never;
  match(
    regexp: RValue<string>
  ): T extends string ? RDatum<MatchResults> : never;
  split(
    seperator: RValue<string>,
    maxSplits?: RValue<number>
  ): T extends string ? RDatum<string[]> : never;
  upcase(): T extends string ? RDatum<string> : never;
  downcase(): T extends string ? RDatum<string> : never;
  add(
    ...str: Array<RValue<string | number>>
  ): T extends string | number | Date ? RDatum<T> : never;
  gt(
    ...value: Array<RValue<string | number | Date>>
  ): T extends string | number | Date ? RDatum<T> : never;
  ge(
    ...value: Array<RValue<string | number | Date>>
  ): T extends string | number | Date ? RDatum<T> : never;
  lt(
    ...value: Array<RValue<string | number | Date>>
  ): T extends string | number | Date ? RDatum<T> : never;
  le(
    ...value: Array<RValue<string | number | Date>>
  ): T extends string | number | Date ? RDatum<T> : never;
  // Works only for numbers
  sub(
    ...num: Array<RValue<number>>
  ): T extends number ? RDatum<number> : T extends Date ? RDatum<Date> : never;
  sub(date: RValue<Date>): T extends Date ? RDatum<number> : never;
  mul(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never;
  div(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never;
  mod(...num: Array<RValue<number>>): T extends number ? RDatum<number> : never;
  round(): T extends number ? RDatum<number> : never;
  ceil(): T extends number ? RDatum<number> : never;
  floor(): T extends number ? RDatum<number> : never;
  // Works only for bool
  and(
    ...bool: Array<RDatum<boolean>>
  ): T extends boolean ? RDatum<number> : never;
  or(
    ...bool: Array<RDatum<boolean>>
  ): T extends boolean ? RDatum<number> : never;
  not(): T extends boolean ? RDatum<number> : never;
  // Works only for Date
  inTimezone(timezone: string): T extends Date ? RDatum<Date> : never;
  timezone(): T extends Date ? RDatum<string> : never;
  during(
    start: RValue<Date>,
    end: RValue<Date>,
    options?: { leftBound: 'open' | 'closed'; rightBound: 'open' | 'closed' }
  ): T extends Date ? RDatum<boolean> : never;
  date(): T extends Date ? RDatum<Date> : never;
  timeOfDay(): T extends Date ? RDatum<number> : never;
  year(): T extends Date ? RDatum<number> : never;
  month(): T extends Date ? RDatum<number> : never;
  day(): T extends Date ? RDatum<number> : never;
  dayOfWeek(): T extends Date ? RDatum<number> : never;
  dayOfYear(): T extends Date ? RDatum<number> : never;
  hours(): T extends Date ? RDatum<number> : never;
  minutes(): T extends Date ? RDatum<number> : never;
  seconds(): T extends Date ? RDatum<number> : never;
  toISO8601(): T extends Date ? RDatum<string> : never;
  toEpochTime(): T extends Date ? RDatum<number> : never;
  // Works only for geo
  distance(
    geo: RValue,
    options: { geoSystem: string; unit: string }
  ): RDatum<number>;
  toGeojson(): RDatum;
  // Works only for line
  fill(): RDatum;
  polygonSub(polygon2: RValue): RDatum;

  toJsonString(): RDatum<string>;
  toJSON(): RDatum<string>;

  eq(...value: RValue[]): RDatum<boolean>;
  ne(...value: RValue[]): RDatum<boolean>;

  keys(): RDatum<string[]>;
  values(): RDatum<Array<T[keyof T]>>;
}

export interface RStream<T = any> extends RQuery<RCursor<T>> {
  forEach<U = any>(
    func: (res: RDatum<T>) => RDatum<WriteResult<U>>
  ): RDatum<WriteResult<U>>;
  changes(options?: ChangesOptions): RStream<Changes<T>>;

  <U extends keyof T>(attribute: RValue<U>): RStream<T[U]>;
  (n: RValue<number>): RDatum<T>;
  getField<U extends keyof T>(fieldName: RValue<U>): RStream<T[U]>;

  // FROM

  innerJoin<U>(
    other: RStream<U>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>>;
  outerJoin<U>(
    other: RStream<U>,
    predicate: (doc1: RDatum<T>, doc2: RDatum<U>) => RValue<boolean>
  ): RStream<JoinResult<T, U>>; // actually left join
  eqJoin<U>(
    fieldOrPredicate: RValue<keyof T> | ((doc1: RDatum<T>) => RValue<boolean>),
    rightTable: RValue<string>,
    options?: { index: string }
  ): RStream<JoinResult<T, U>>;

  zip(): T extends JoinResult<infer U1, infer U2> ? U1 & U2 : never;

  union<U = T>(
    ...other: Array<RStream<U> | RValue<U[]> | { interleave: boolean | string }>
  ): RStream<U>;
  map<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>;
  concatMap<U = any>(
    ...args: Array<RStream | ((arg: RDatum<T>, ...args: RDatum[]) => any)>
  ): RStream<U>;

  // WHERE

  withFields<U extends keyof T>(field: RValue<U>): RStream<Pick<T, U>>;
  withFields<U1 extends keyof T, U2 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>
  ): RStream<Pick<T, U1> & Pick<T, U2>>;
  withFields<U1 extends keyof T, U2 extends keyof T, U3 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>
  ): RStream<Pick<T, U1> & Pick<T, U2> & Pick<T, U3>>;
  withFields<
    U1 extends keyof T,
    U2 extends keyof T,
    U3 extends keyof T,
    U4 extends keyof T
  >(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>,
    field4: RValue<U4>
  ): RStream<Pick<T, U1> & Pick<T, U2> & Pick<T, U3> & Pick<T, U4>>;
  withFields(...fields: Array<RValue<keyof T>>): RStream<Partial<T>>;
  hasFields(...fields: Array<RValue<keyof T>>): RStream<T>;
  filter(
    predicate: (doc: RDatum<T>) => RValue<boolean>,
    options?: { default: boolean }
  ): this;
  includes(geometry: RDatum): RStream<T>;
  intersects(geometry: RDatum): RStream<T>;

  // LOGIC
  contains(value: any): RDatum<boolean>; // also predicate

  // ORDER BY
  orderBy(index: { index: string }): RStream<T>; // also r.desc(string)
  orderBy(field: RValue<string>, index?: { index: string }): RStream<T>;
  orderBy(
    field1: RValue<string>,
    field2: RValue<string>,
    index?: { index: string }
  ): RStream<T>;
  orderBy(
    field1: RValue<string>,
    field2: RValue<string>,
    field3: RValue<string>,
    index?: { index: string }
  ): RStream<T>;
  orderBy(
    field1: RValue<string>,
    field2: RValue<string>,
    field3: RValue<string>,
    field4: RValue<string>,
    index?: { index: string }
  ): RStream;

  // GROUP
  group<U extends keyof T>(
    field: RValue<U>,
    index?: { index?: string; multi?: boolean }
  ): RDatum; // <GroupResults<T[U], T[]>>;
  group<U1 extends keyof T, U2 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>,
    index?: { index?: string; multi?: boolean }
  ): RDatum; // <GroupResults<[T[U1], T[U2]], T[]>>;
  group<U1 extends keyof T, U2 extends keyof T, U3 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>,
    index?: { index?: string; multi?: boolean }
  ): RDatum; // <GroupResults<[T[U1], T[U2], T[U3]], T[]>>;
  group<
    U1 extends keyof T,
    U2 extends keyof T,
    U3 extends keyof T,
    U4 extends keyof T
  >(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>,
    field4: RValue<U4>,
    index?: { index?: string; multi?: boolean }
  ): RDatum; // <GroupResults<[T[U1], T[U2], T[U3], T[U4]], T[]>>;

  // SELECT FUNCTIONS
  count(
    value?: RValue<T> | ((doc: RDatum<T>) => RValue<boolean>)
  ): RDatum<number>;
  sum(
    value?: RValue<T> | ((doc: RDatum<T>) => RValue<number | null>)
  ): RDatum<number>;
  avg(
    value?: RValue<T> | ((doc: RDatum<T>) => RValue<number | null>)
  ): RDatum<number>;
  min(
    value?:
      | RValue<T>
      | ((doc: RDatum<T>) => RValue<number | null>)
      | { index: string }
  ): RDatum<number>;
  max(
    value?:
      | RValue<T>
      | ((doc: RDatum<T>) => RValue<number | null>)
      | { index: string }
  ): RDatum<number>;
  reduce<U = any>(
    reduceFunction: (left: RDatum<T>, right: RDatum<T>) => any
  ): RDatum<U>;
  fold<ACC = any, RES = any>(
    base: any,
    foldFunction: (acc: RDatum<ACC>, next: RDatum<T>) => any, // this any is ACC
    options?: {
      // tslint:disable-next-line:variable-name
      emit?: (acc: RDatum<ACC>, next: RDatum<T>, new_acc: RDatum<ACC>) => any[]; // this any is RES
      finalEmit?: (acc: RStream) => any[]; // this any is also RES
    }
  ): RStream<RES>;
  // SELECT
  distinct(): RStream<T>;
  distinct<TIndex = any>(index: { index: string }): RStream<TIndex>;

  pluck<U extends keyof T>(field: RValue<U>): RStream<Pick<T, U>>;
  pluck<U1 extends keyof T, U2 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>
  ): RStream<Pick<T, U1> & Pick<T, U2>>;
  pluck<U1 extends keyof T, U2 extends keyof T, U3 extends keyof T>(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>
  ): RStream<Pick<T, U1> & Pick<T, U2> & Pick<T, U3>>;
  pluck<
    U1 extends keyof T,
    U2 extends keyof T,
    U3 extends keyof T,
    U4 extends keyof T
  >(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>,
    field4: RValue<U4>
  ): RStream<Pick<T, U1> & Pick<T, U2> & Pick<T, U3> & Pick<T, U4>>;
  pluck(...fields: Array<RValue<keyof T>>): RStream<Partial<T>>;

  without<U extends keyof T>(field: RValue<U>): RStream<Omit<T, U>>;
  without<U1 extends keyof T, U2 extends keyof Omit<T, U1>>(
    field1: RValue<U1>,
    field2: RValue<U2>
  ): RStream<Omit<Omit<T, U1>, U2>>;
  without<
    U1 extends keyof T,
    U2 extends keyof Omit<T, U1>,
    U3 extends keyof Omit<Omit<T, U1>, U2>
  >(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>
  ): RStream<Omit<Omit<Omit<T, U1>, U2>, U3>>;
  without<
    U1 extends keyof T,
    U2 extends keyof Omit<T, U1>,
    U3 extends keyof Omit<Omit<T, U1>, U2>,
    U4 extends keyof Omit<Omit<Omit<T, U1>, U2>, U3>
  >(
    field1: RValue<U1>,
    field2: RValue<U2>,
    field3: RValue<U3>,
    field4: RValue<U4>
  ): RStream<Omit<Omit<Omit<Omit<T, U1>, U2>, U3>, U4>>;
  without(...fields: Array<RValue<keyof T>>): RStream<Partial<T>>;

  merge<U = any>(...objects: any[]): RStream<U>;

  skip(n: RValue<number>): RStream<T>;
  limit(n: RValue<number>): RStream<T>;
  slice(
    start: RValue<number>,
    end?: RValue<number>,
    options?: { leftBound: 'open' | 'closed'; rightBound: 'open' | 'closed' }
  ): RStream;
  nth(n: RValue<number>): RDatum<T>;
  sample(n: RValue<number>): RDatum<T[]>;
  offsetsOf(
    single: RValue<T> | ((doc: RDatum<T>) => RValue<boolean>)
  ): RDatum<number[]>;

  isEmpty(): RDatum<boolean>;

  coerceTo(type: 'array'): RDatum<T[]>;
  coerceTo<U = any>(type: 'object'): RDatum<U>;
}

export interface RSingleSelection<T = any> extends RDatum<T> {
  update(
    obj: RValue<Partial<T>>,
    options?: UpdateOptions
  ): RDatum<WriteResult<T>>;
  replace(obj: RValue<T>, options?: UpdateOptions): RDatum<WriteResult<T>>;
  delete(options?: DeleteOptions): RDatum<WriteResult<T>>;
  changes(options?: ChangesOptions): RStream<Changes<T>>;
}

export interface RSelection<T = any> extends RStream<T> {
  update(
    obj: RValue<Partial<T>>,
    options: UpdateOptions
  ): RDatum<WriteResult<T>>;
  replace(obj: RValue<T>, options: UpdateOptions): RDatum<WriteResult<T>>;
  delete(options: DeleteOptions): RDatum<WriteResult<T>>;
}
export interface RTable<T = any> extends RSelection<T> {
  grant(
    userName: string,
    options: {
      read: boolean;
      write: boolean;
      connect: boolean;
      config: boolean;
    }
  ): RDatum<{
    granted: number;
    permissions_changes: Array<
      ValueChange<{
        read: boolean;
        write: boolean;
        connect: boolean;
        config: boolean;
      }>
    >;
  }>;
  indexCreate(
    indexName: RValue<string>,
    indexFunction?: RDatum | RDatum[] | ((row: RDatum) => any),
    options?: IndexOptions
  ): RDatum<{ created: number }>;
  indexCreate(
    indexName: RValue<string>,
    options?: { multi: boolean; geo: boolean }
  ): RDatum<{ created: number }>;

  indexDrop(indexName: RValue<string>): RDatum<{ dropped: number }>;
  indexList(): RDatum<string[]>;
  indexRename(
    oldName: RValue<string>,
    newName: RValue<string>,
    options?: { overwrite: boolean }
  ): RDatum<{ renamed: number }>;
  indexStatus(...indexName: string[]): RDatum<IndexStatus>;
  indexWait(...indexName: string[]): RDatum<IndexStatus>;

  insert(obj: any, options?: InsertOptions): RDatum<WriteResult<T>>;
  sync(): RDatum<{ synced: number }>;

  get(key: any): RSingleSelection<T>;
  getAll(key: any, options?: { index: string }): RSelection<T>;
  getAll(key1: any, key2: any, options?: { index: string }): RSelection<T>;
  getAll(
    key1: any,
    key2: any,
    key3: any,
    options?: { index: string }
  ): RSelection<T>;
  getAll(
    key1: any,
    key2: any,
    key3: any,
    key4: any,
    options?: { index: string }
  ): RSelection<T>;

  between(
    lowKey: any,
    highKey: any,
    options?: {
      index?: string;
      leftBound: 'open' | 'closed';
      rightBound: 'open' | 'closed';
    }
  ): RSelection<T>;
  getIntersecting(geometry: RDatum, index: { index: string }): RStream<T>;
  getNearest(
    geometry: RDatum,
    options: {
      index: string;
      maxResults?: number;
      maxDist?: number;
      unit?: string;
      geoSystem?: string;
    }
  ): RStream<T>;

  config(): RSingleSelection<DBConfig>;
  status(): RDatum<TableStatus>;
  rebalance(): RDatum<RebalanceResult>;
  reconfigure(options: TableReconfigureOptions): RDatum<ReconfigureResult>;
  wait(options?: WaitOptions): RDatum<{ ready: 1 }>;
}
export interface RDatabase {
  grant(
    userName: string,
    options: {
      read: boolean;
      write: boolean;
      connect: boolean;
      config: boolean;
    }
  ): RDatum<{
    granted: number;
    permissions_changes: Array<
      ValueChange<{
        read: boolean;
        write: boolean;
        connect: boolean;
        config: boolean;
      }>
    >;
  }>;
  tableCreate(
    tableName: RValue<string>,
    options: TableCreateOptions
  ): RDatum<TableChangeResult>;
  tableDrop(tableName: RValue<string>): RDatum<TableChangeResult>;
  tableList(): RDatum<string[]>;
  table<T = any>(tableName: RValue<string>): RTable<T>;

  config(): RSingleSelection<DBConfig>;
  rebalance(): RDatum<RebalanceResult>;
  reconfigure(options: TableReconfigureOptions): RDatum<ReconfigureResult>;
  wait(options: WaitOptions): RDatum<{ ready: number }>;
}

export interface R {
  minval: RValue;
  maxval: RValue;
  // row: RDatum;
  monday: RValue;
  tuesday: RValue;
  wednesday: RValue;
  thursday: RValue;
  friday: RValue;
  saturday: RValue;
  sunday: RValue;
  january: RValue;
  february: RValue;
  march: RValue;
  april: RValue;
  may: RValue;
  june: RValue;
  july: RValue;
  august: RValue;
  september: RValue;
  october: RValue;
  november: RValue;
  december: RValue;
  desc(indexName: string): any;
  asc(indexName: string): any;
  grant(
    userName: string,
    options: {
      read: boolean;
      write: boolean;
      connect: boolean;
      config: boolean;
    }
  ): RDatum<{
    granted: number;
    permissions_changes: Array<
      ValueChange<{
        read: boolean;
        write: boolean;
        connect: boolean;
        config: boolean;
      }>
    >;
  }>;

  dbCreate(dbName: string): RDatum<DBConfig>;
  dbDrop(dbName: string): RDatum<DBChangeResult>;
  dbList(): RDatum<string[]>;
  db(dbName: string): RDatabase;

  // For default database
  tableCreate(
    tableName: RValue<string>,
    options?: TableCreateOptions
  ): RDatum<TableChangeResult>;
  tableDrop(tableName: RValue<string>): RDatum<TableChangeResult>;
  tableList(): RDatum<string>;
  table<T = any>(tableName: RValue<string>): RTable<T>;
  // additional
  map<T = any>(
    stream1: RStream,
    mapFunction: (doc1: RDatum) => any
  ): RStream<T>;
  map<T = any, U1 = any, U2 = any>(
    stream1: RStream<U1>,
    stream2: RStream<U2>,
    mapFunction: (doc1: RDatum<U1>, doc2: RDatum<U2>) => any
  ): RStream<T>;
  map(
    stream1: RStream,
    stream2: RStream,
    stream3: RStream,
    mapFunction: (doc1: RDatum, doc2: RDatum, doc3: RDatum) => any
  ): RStream;

  literal<T>(obj: T): RDatum<T>;
  object<T = any>(...keyValue: any[]): RDatum<T>; // should be (key: string, value: any...)
  and(...bool: Array<boolean | RDatum>): RDatum<boolean>;
  or(...bool: Array<boolean | RDatum>): RDatum<boolean>;
  not(bool: boolean | RDatum): RDatum<boolean>;
  random(
    lowBound?: RValue<number>,
    highBound?: RValue<number> | { float: boolean },
    options?: { float: boolean }
  ): RDatum<number>;
  round(num: RValue<number>): RDatum<number>;
  ceil(bool: RValue<number>): RDatum<number>;
  floor(bool: RValue<number>): RDatum<number>;
  now(): RDatum<Date>;
  time(
    year: RValue<number>,
    month: RValue<number>,
    day: RValue<number>,
    hour: RValue<number>,
    minute: RValue<number>,
    second: RValue<number>,
    timezone: RValue<string>
  ): RDatum<Date>;
  time(
    year: RValue<number>,
    month: RValue<number>,
    day: RValue<number>,
    timezone: RValue<string>
  ): RDatum<Date>;
  epochTime(epochTime: RValue<number>): RDatum<Date>;
  ISO8601(
    time: RValue<string>,
    options?: { defaultTimezone: string }
  ): RDatum<Date>;
  args(arg: any): any;
  binary(data: any): RDatum<Buffer>;
  branch<T>(
    test: RValue<boolean>,
    trueBranch: T,
    falseBranchOrTest: any,
    ...branches: any[]
  ): T extends RStream ? RStream : RDatum;
  range(
    startValue?: RValue<number>,
    endValue?: RValue<number>
  ): RStream<number>;
  error(message?: RValue<string>): any;
  expr<T>(val: T): RDatum<T>;
  <T>(val: T): RDatum<T>;
  js(js: RValue<string>): RDatum;
  json(json: RValue<string>): RDatum;
  http(url: RValue<string>, options: HttpRequestOptions): RDatum;
  http(url: RValue<string>, options: HTTPStreamRequestOptions): RStream;
  uuid(val?: RValue<string>): RDatum<string>;
  circle(
    longitudeLatitude: [string, string] | RDatum,
    radius: RValue<number>,
    options?: {
      numVertices?: number;
      geoSystem?: 'WGS84' | 'unit_sphere';
      unit?: 'm' | 'km' | 'mi' | 'nm' | 'ft';
      fill?: boolean;
    }
  ): RDatum;
  line(...points: Array<[string, string]>): RDatum;
  line(...points: RDatum[]): RDatum;
  point(longitude: string, latitude: string): RDatum;
  polygon(...points: RDatum[]): RDatum;
  polygon(...longitudeLatitudes: Array<[string, string]>): RDatum;
  add(...args: Array<RValue<string>>): RValue<string>;
  add(...args: Array<RValue<number>>): RValue<number>;
  add(...args: Array<RValue<any[]>>): RValue<any[]>;
  union(...args: RStream[]): RStream;
  union(...args: Array<RValue<any[]>>): RValue<any[]>;

  geojson(geoJSON: any): RDatum;
  distance(
    geo1: RDatum,
    geo2: RDatum,
    options?: {
      geoSystem?: 'WGS84' | 'unit_sphere';
      unit?: 'm' | 'km' | 'mi' | 'nm' | 'ft';
    }
  ): RStream;
  intersects<T>(stream: RStream<T>, geometry: RDatum): RStream<T>;
  intersects(geometry1: RDatum, geometry2: RDatum): RDatum<boolean>;
  wait(options: WaitOptions): RStream;

  do<T>(arg: RDatum, func: (arg: RDatum) => T): T extends RStream ? T : RDatum;
  do<T>(
    arg1: RDatum,
    arg2: RDatum,
    func: (arg1: RDatum, arg2: RDatum) => T
  ): T extends RStream ? T : RDatum;
  do<T>(
    arg1: RDatum,
    arg2: RDatum,
    arg3: RDatum,
    func: (arg1: RDatum, arg2: RDatum, arg3: RDatum) => T
  ): T extends RStream ? T : RDatum;
  do<T>(
    arg1: RDatum,
    arg2: RDatum,
    arg3: RDatum,
    arg4: RDatum,
    func: (arg1: RDatum, arg2: RDatum, arg3: RDatum, arg4: RDatum) => T
  ): T extends RStream ? T : RDatum;

  connect(
    optionsOrHost: (ConnectionOptions & { pool: false }) | string
  ): Promise<Connection>;
  connect(optionsOrHost: ConnectionOptions | string): Promise<ConnectionPool>;
  getPoolMaster(): ConnectionPool | undefined;
}

//#endregion operations
