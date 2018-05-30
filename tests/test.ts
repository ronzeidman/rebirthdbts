//tslint:disable
import { Connection, r } from '../src';
import * as config from './config';
let connection: Connection; // global connection
let dbName: string;
let tableName: string;
let result: any;
(async () => {
  await r.connect(config);
  result = await r.expr({ a: 1, b: r.expr(1).add('eh') }).run();
  console.log(result);
})();
