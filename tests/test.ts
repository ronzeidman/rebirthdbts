//tslint:disable
import { Connection, r } from '../src';
import * as config from './config';
let connection: Connection; // global connection
let dbName: string;
let tableName: string;
let result: any;
(async () => {
  await r.connect(config);
  result = await r
    .db('aff47babaa6a024cbd0d48d5d7258f48')
    .table('ff946249690c8a0f0d24c5713f0943fe')
    .reconfigure({ foo: 1 } as any)
    .run();
  console.log(result);
})();
