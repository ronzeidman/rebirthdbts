// 21 passing (4s)
// 3 failing
import assert from 'assert';
import { r } from '../src';
import config from './config';
import { uuid } from './util/common';

describe('pool legacy', () => {
  let dbName: string;
  let tableName: string;
  let pks: string;

  before(async () => {
    await r.connectPool(config);

    dbName = uuid();
    tableName = uuid();

    let result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);

    result = await r
      .db(dbName)
      .table(tableName)
      .insert(Array(100).fill({}))
      .run();
    assert.equal(result.inserted, 100);
    pks = result.generated_keys;
  });

  after(async () => {
    await r.getPoolMaster().drain();
  });

  it('`db` should work', async () => {
    const result = await r
      .db(dbName)
      .info()
      .run();
    assert.equal(result.name, dbName);
    assert.equal(result.type, 'DB');
  });

  it('`table` should work', async () => {
    let result = await r
      .db(dbName)
      .table(tableName)
      .info()
      .run();
    assert.equal(result.name, tableName);
    assert.equal(result.type, 'TABLE');
    assert.equal(result.primary_key, 'id');
    assert.equal(result.db.name, dbName);

    result = await r
      .db(dbName)
      .table(tableName)
      .run();
    assert.equal(result.length, 100);
  });

  it('`table` should work with readMode', async () => {
    let result = await r
      .db(dbName)
      .table(tableName, { readMode: 'majority' })
      .run();
    assert.equal(result.length, 100);

    result = await r
      .db(dbName)
      .table(tableName, { readMode: 'majority' })
      .run();
    assert.equal(result.length, 100);
  });

  it('`table` should throw with non valid otpions', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName, { nonValidKey: false })
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(
        e.message.startsWith(
          'Unrecognized optional argument `non_valid_key` in:'
        )
      );
    }
  });

  it('`get` should work', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .get(pks[0])
      .run();
    assert.deepEqual(result, { id: pks[0] });
  });

  it('`get` should throw if no argument is passed', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName)
        .get()
        .run();
      assert.fail('should throw');
    } catch (e) {
      // assert(e instanceof r.Error.ReqlDriverError)
      assert(e instanceof Error);
      assert.equal(
        e.message,
        '`get` takes 1 argument, 0 provided after:\nr.db("' +
          dbName +
          '").table("' +
          tableName +
          '")\n'
      );
    }
  });

  it('`getAll` should work with multiple values - primary key', async () => {
    let table = r.db(dbName).table(tableName);
    let query = table.getAll.apply(table, pks);
    let result = await query.run();
    assert.equal(result.length, 100);

    table = r.db(dbName).table(tableName);
    query = table.getAll.apply(table, pks.slice(0, 50));
    result = await query.run();
    assert.equal(result.length, 50);
  });

  it('`getAll` should work with no argument - primary key', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .getAll()
      .run();
    assert.equal(result.length, 0);
  });

  it('`getAll` should work with no argument - index', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .getAll({ index: 'id' })
      .run();
    assert.equal(result.length, 0);
  });

  it('`getAll` should work with multiple values - secondary index 1', async () => {
    let result = await r
      .db(dbName)
      .table(tableName)
      .update({ field: 0 })
      .run();
    assert.equal(result.replaced, 100);
    result = await r
      .db(dbName)
      .table(tableName)
      .sample(20)
      .update({ field: 10 })
      .run();
    assert.equal(result.replaced, 20);

    result = await r
      .db(dbName)
      .table(tableName)
      .indexCreate('field')
      .run();
    assert.deepEqual(result, { created: 1 });

    result = await r
      .db(dbName)
      .table(tableName)
      .indexWait('field')
      .pluck('index', 'ready')
      .run();
    assert.deepEqual(result, [{ index: 'field', ready: true }]);

    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(10, { index: 'field' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`getAll` should return native dates (and cursor should handle them)', async () => {
    let result = await r
      .db(dbName)
      .table(tableName)
      .insert({ field: -1, date: r.now() })
      .run();
    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(-1, { index: 'field' })
      .run();
    assert(result[0].date instanceof Date);
    // Clean for later
    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(-1, { index: 'field' })
      .delete()
      .run();
  });

  it('`getAll` should work with multiple values - secondary index 2', async () => {
    let result = await r
      .db(dbName)
      .table(tableName)
      .indexCreate('fieldAddOne', function(doc) {
        return doc('field').add(1);
      })
      .run();
    assert.deepEqual(result, { created: 1 });

    result = await r
      .db(dbName)
      .table(tableName)
      .indexWait('fieldAddOne')
      .pluck('index', 'ready')
      .run();
    assert.deepEqual(result, [{ index: 'fieldAddOne', ready: true }]);

    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(11, { index: 'fieldAddOne' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`between` should wrok -- secondary index', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .between(5, 20, { index: 'fieldAddOne' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`between` should wrok -- all args', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .between(5, 20, {
        index: 'fieldAddOne',
        leftBound: 'open',
        rightBound: 'closed'
      })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`between` should throw if no argument is passed', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName)
        .between()
        .run();
      assert.fail('should throw');
    } catch (e) {
      // assert(e instanceof r.Error.ReqlDriverError)
      assert(e instanceof Error);
      assert.equal(
        e.message,
        '`between` takes at least 2 arguments, 0 provided after:\nr.db("' +
          dbName +
          '").table("' +
          tableName +
          '")\n'
      );
    }
  });

  it('`between` should throw if non valid arg', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName)
        .between(1, 2, { nonValidKey: true })
        .run();
      assert.fail('should throw');
    } catch (e) {
      // assert(e instanceof r.Error.ReqlDriverError)
      assert(e instanceof Error);
      assert(
        e.message.startsWith(
          'Unrecognized optional argument `non_valid_key` in:'
        )
      );
    }
  });

  it('`filter` should work -- with an object', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter({ field: 10 })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`filter` should work -- with an object -- looking for an undefined field', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 })
      .run();
    assert(result);
    assert.equal(result.length, 0);
  });

  it('`filter` should work -- with an anonymous function', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter(function(doc) {
        return doc('field').eq(10);
      })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  });

  it('`filter` should work -- default true', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 }, { default: true })
      .run();
    assert(result);
    assert.equal(result.length, 100);
  });

  it('`filter` should work -- default false', async () => {
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 }, { default: false })
      .run();
    assert(result);
    assert.equal(result.length, 0);
  });

  it('`filter` should work -- default false', async () => {
    try {
      await r
        .expr([{ a: 1 }, {}])
        .filter(row => row('a'), { default: r.error() })
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(e.message.match(/^No attribute `a` in object:/));
    }
  });

  it('`filter` should throw if no argument is passed', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName)
        .filter()
        .run();
      assert.fail('should throw');
    } catch (e) {
      // assert(e instanceof r.Error.ReqlDriverError)
      assert(e instanceof Error);
      assert.equal(
        e.message,
        '`filter` takes at least 1 argument, 0 provided after:\nr.db("' +
          dbName +
          '").table("' +
          tableName +
          '")\n'
      );
    }
  });

  it('`filter` should throw with a non valid option', async () => {
    try {
      await r
        .db(dbName)
        .table(tableName)
        .filter(true, { nonValidKey: false })
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(
        e.message.startsWith(
          'Unrecognized optional argument `non_valid_key` in:'
        )
      );
    }
  });
});
