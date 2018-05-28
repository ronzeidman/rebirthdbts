import * as config from './config';
import { r } from '../src';
r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';

let dbName, tableName, result, pks;

it('Init for `selecting-data.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);

    result = await r
      .db(dbName)
      .table(tableName)
      .insert(eval('[' + new Array(100).join('{}, ') + '{}]'))
      .run();
    assert.equal(result.inserted, 100);
    pks = result.generated_keys;
  } catch (e) {
    throw e;
  }
});

it('`db` should work', async () => {
  try {
    result = await r
      .db(dbName)
      .info()
      .run();
    assert.equal(result.name, dbName);
    assert.equal(result.type, 'DB');
  } catch (e) {
    throw e;
  }
});

it('`table` should work', async () => {
  try {
    result = await r
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
  } catch (e) {
    throw e;
  }
});
it('`table` should work with readMode', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName, { readMode: 'majority' })
      .run();
    assert.equal(result.length, 100);

    result = await r
      .db(dbName)
      .table(tableName, { readMode: 'majority' })
      .run();
    assert.equal(result.length, 100);
  } catch (e) {
    throw e;
  }
});
it('`table` should throw with non valid otpions', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName, { nonValidKey: false })
      .run();
  } catch (e) {
    if (
      e.message ===
      'Unrecognized option `nonValidKey` in `table` after:\nr.db("' +
        dbName +
        '")\nAvailable option is readMode <string>'
    ) {
    } else {
      throw e;
    }
  }
});

it('`get` should work', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .get(pks[0])
      .run();
    assert.deepEqual(result, { id: pks[0] });
  } catch (e) {
    throw e;
  }
});
it('`get` should throw if no argument is passed', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .get()
      .run();
  } catch (e) {
    assert(e instanceof r.Error.ReqlDriverError);
    assert(e instanceof Error);
    if (
      e.message ===
      '`get` takes 1 argument, 0 provided after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")'
    ) {
    } else {
      throw e;
    }
  }
});

it('`getAll` should work with multiple values - primary key', async () => {
  try {
    let table = r.db(dbName).table(tableName);
    let query = table.getAll.apply(table, pks);
    result = await query.run();
    assert.equal(result.length, 100);

    table = r.db(dbName).table(tableName);
    query = table.getAll.apply(table, pks.slice(0, 50));
    result = await query.run();
    assert.equal(result.length, 50);
  } catch (e) {
    throw e;
  }
});

it('`getAll` should work with no argument - primary key', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getAll()
      .run();
    assert.equal(result.length, 0);
  } catch (e) {
    throw e;
  }
});

it('`getAll` should work with no argument - index', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getAll({ index: 'id' })
      .run();
    assert.equal(result.length, 0);
  } catch (e) {
    throw e;
  }
});

it('`getAll` should work with multiple values - secondary index 1', async () => {
  try {
    let result: any = await r
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

    // Yield one second -- See https://github.com/rethinkdb/rethinkdb/issues/2170
    let p = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, 1000);
    });
    await p;
    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(10, { index: 'field' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  } catch (e) {
    throw e;
  }
});
it('`getAll` should return native dates (and cursor should handle them)', async () => {
  try {
    let result: any = await r
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
  } catch (e) {
    throw e;
  }
});

it('`getAll` should work with multiple values - secondary index 2', async () => {
  try {
    let result: any = await r
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

    // Yield one second -- See https://github.com/rethinkdb/rethinkdb/issues/2170
    let p = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, 1000);
    });
    await p;

    result = await r
      .db(dbName)
      .table(tableName)
      .getAll(11, { index: 'fieldAddOne' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  } catch (e) {
    throw e;
  }
});

it('`between` should wrok -- secondary index', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .between(5, 20, { index: 'fieldAddOne' })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  } catch (e) {
    throw e;
  }
});
it('`between` should wrok -- all args', async () => {
  try {
    let result: any = await r
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
  } catch (e) {
    throw e;
  }
});
it('`between` should throw if no argument is passed', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .between()
      .run();
  } catch (e) {
    assert(e instanceof r.Error.ReqlDriverError);
    assert(e instanceof Error);
    if (
      e.message ===
      '`between` takes at least 2 arguments, 0 provided after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")'
    ) {
    } else {
      throw e;
    }
  }
});
it('`between` should throw if non valid arg', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .between(1, 2, { nonValidKey: true })
      .run();
  } catch (e) {
    assert(e instanceof r.Error.ReqlDriverError);
    assert(e instanceof Error);
    if (
      e.message ===
      'Unrecognized option `nonValidKey` in `between` after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")\nAvailable options are index <string>, leftBound <string>, rightBound <string>'
    ) {
    } else {
      throw e;
    }
  }
});

it('`filter` should work -- with an object', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter({ field: 10 })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  } catch (e) {
    throw e;
  }
});
it('`filter` should work -- with an object -- looking for an undefined field', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 })
      .run();
    assert(result);
    assert.equal(result.length, 0);
  } catch (e) {
    throw e;
  }
});

it('`filter` should work -- with an anonymous function', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter(function(doc) {
        return doc('field').eq(10);
      })
      .run();
    assert(result);
    assert.equal(result.length, 20);
  } catch (e) {
    throw e;
  }
});

it('`filter` should work -- default true', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 }, { default: true })
      .run();
    assert(result);
    assert.equal(result.length, 100);
  } catch (e) {
    throw e;
  }
});

it('`filter` should work -- default false', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter({ nonExistingField: 10 }, { default: false })
      .run();
    assert(result);
    assert.equal(result.length, 0);
  } catch (e) {
    throw e;
  }
});

it('`filter` should work -- default false', async () => {
  try {
    let result: any = await r
      .expr([{ a: 1 }, {}])
      .filter(row => row('a'), { default: r.error() })
      .run();
  } catch (e) {
    if (e.message.match(/^No attribute `a` in object:/)) {
      return;
    } else {
      throw e;
    }
  }
});
it('`filter` should throw if no argument is passed', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter()
      .run();
  } catch (e) {
    assert(e instanceof r.Error.ReqlDriverError);
    assert(e instanceof Error);
    if (
      e.message ===
      '`filter` takes at least 1 argument, 0 provided after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")'
    ) {
    } else {
      throw e;
    }
  }
});
it('`filter` should throw with a non valid option', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .filter(true, { nonValidKey: false })
      .run();
  } catch (e) {
    if (
      e.message.match(/^Unrecognized option `nonValidKey` in `filter` after:/)
    ) {
    } else {
      throw e;
    }
  }
});
