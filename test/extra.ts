// 2 passing (1s)
// 3 failing
import assert from 'assert';
import { r } from '../src';
import config from './config';
import { uuid } from './util/common';

describe('extra', () => {
  let dbName: string;
  let tableName: string;

  before(async () => {
    await r.connectPool(config);
    dbName = uuid();
    tableName = uuid(); // Big table to test partial sequence

    let result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)('tables_created')
      .run();
    assert.deepEqual(result, 1);
  });

  after(async () => {
    await r.getPoolMaster().drain();
  });

  it('Change the default database on the fly in run', async () => {
    const result = await r.tableList().run({ db: dbName });
    assert.deepEqual(result, [tableName]);
  });

  it('Anonymous function should throw if they return undefined', async () => {
    try {
      r.expr(1).do(function() {});
      assert.fail('should throw');
    } catch (e) {
      assert.equal(
        e.message,
        'Anonymous function returned `undefined`. Did you forget a `return`? in:\nfunction () { }'
      );
    }
  });

  it('toString should work', () => {
    let result = r
      .expr(1)
      .add(2)
      .toString();
    assert.equal(result, 'r.expr(1).add(2)');

    result = r.expr(1).toString();
    assert.equal(result, 'r.expr(1)');
  });

  // it('await a query should work - 1', async () => {
  //   let result = await r.expr(1);
  //   assert.equal(result, 1);

  //   result = await r.expr(1).add(3);
  //   assert.equal(result, 4);
  // });

  // it('await a query should work - 2', async () => {
  //   try {
  //     await r.expr(1).add('foo');
  //     assert.fail('should throw');
  //   } catch (e) {
  //     assert(e.message.match(/Expected type NUMBER but found STRING/));
  //   }
  // });
});
