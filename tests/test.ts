//tslint:disable
import assert from 'assert';
import { Connection, r } from '../src';
import * as config from './config';
let connection: Connection; // global connection
let dbName: string;
let tableName: string;
let result: any;
(async () => {
  await r.connect(config);
  try {
    result = await r
      .expr([
        { name: 'Michel', date: r.now() },
        { name: 'Laurent', date: r.now() },
        { name: 'Sophie', date: r.now().sub(1000) }
      ])
      .group('date')
      .run();
    console.dir(result);
    assert.equal(result.length, 2);
    assert(result[0].group instanceof Date);
    assert(result[0].reduction[0].date instanceof Date);
    console.log(result);
  } catch (e) {
    throw e;
  }
})();
