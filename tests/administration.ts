//tslint:disable
import assert from 'assert';
import { r } from '../src';
import * as config from './config';
import { uuid } from './util/common';
r.connect(config);
let dbName: string;
let tableName: string;
let result: any;
let pks: string[];

it('Init for `administration.js`', async () => {
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

it('`config` should work', async () => {
  try {
    result = await r
      .db(dbName)
      .config()
      .run();
    assert.equal(result.name, dbName);

    result = await r
      .db(dbName)
      .table(tableName)
      .config()
      .run();
    assert.equal(result.name, tableName);
  } catch (e) {
    throw e;
  }
});

it('`config` should throw if called with an argument', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .config('hello')
      .run();
  } catch (e) {
    if (e.message.match(/^`config` takes 0 argument, 1 provided after:/)) {
      return;
    } else {
      throw e;
    }
  }
});

it('`status` should work', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .status()
      .run();
    assert.equal(result.name, tableName);
    assert.notEqual(result.status, undefined);
  } catch (e) {
    throw e;
  }
});

it('`status` should throw if called with an argument', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .status('hello')
      .run();
  } catch (e) {
    if (e.message.match(/^`status` takes 0 argument, 1 provided after:/)) {
      return;
    } else {
      throw e;
    }
  }
});

it('`wait` should work', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .wait()
      .run();
    assert.equal(result.ready, 1);

    await r
      .db(dbName)
      .table(tableName)
      .wait({ waitFor: 'ready_for_writes', timeout: 2000 })
      .run();
  } catch (e) {
    throw e;
  }
});

it('`wait` should work with options', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .wait({ waitFor: 'ready_for_writes' })
      .run();
    assert.equal(result.ready, 1);
  } catch (e) {
    throw e;
  }
});

it('`r.wait` should throw', async () => {
  try {
    result = await r.wait().run();
    throw new Error('r.wait is expected to throw');
  } catch (e) {
    if (
      e.message.match(
        /^`wait` can only be called on a table or a database since 2.3./
      )
    ) {
    } else {
      throw e;
    }
  }
});

it('`wait` should throw if called with 2 arguments', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .wait('hello', 'world')
      .run();
  } catch (e) {
    if (
      e.message.match(/^`wait` takes at most 1 argument, 2 provided after:/)
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('`reconfigure` should work - 1', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .reconfigure({ shards: 1, replicas: 1 })
      .run();
    assert.equal(result.reconfigured, 1);
  } catch (e) {
    console.log(e);
    throw e;
  }
});

it('`reconfigure` should work - 2 - dryRun', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .reconfigure({ shards: 1, replicas: 1, dryRun: true })
      .run();
    assert.equal(result.reconfigured, 0);
  } catch (e) {
    throw e;
  }
});

it('`r.reconfigure` should throw', async () => {
  try {
    result = await r.reconfigure().run();
    throw new Error('r.reconfigure is expected to throw');
  } catch (e) {
    if (
      e.message.match(
        /^`reconfigure` can only be called on a table or a database since 2.3./
      )
    ) {
    } else {
      throw e;
    }
  }
});

it('`reconfigure` should throw on an unrecognized key', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .reconfigure({ foo: 1 })
      .run();
    assert.equal(result.reconfigured, 0);
  } catch (e) {
    if (e.message.match(/^Unrecognized option `foo` in `reconfigure` after:/)) {
    } else {
      throw e;
    }
  }
});

it('`reconfigure` should throw on a number', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .reconfigure(1)
      .run();
  } catch (e) {
    if (
      e.message.match(/^First argument of `reconfigure` must be an object./)
    ) {
    } else {
      throw e;
    }
  }
});

it('`rebalanced` should work - 1', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .rebalance()
      .run();
    assert.equal(result.rebalanced, 1);
  } catch (e) {
    console.log(e);
    throw e;
  }
});

it('`r.rebalance` should throw', async () => {
  try {
    result = await r.rebalance().run();
    throw new Error('r.rebalance is expected to throw');
  } catch (e) {
    if (
      e.message.match(
        /^`rebalance` can only be called on a table or a database since 2.3./
      )
    ) {
    } else {
      throw e;
    }
  }
});

it('`rebalance` should throw if an argument is provided', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .rebalance(1)
      .run();
  } catch (e) {
    if (e.message.match(/^`rebalance` takes 0 argument, 1 provided after:/)) {
    } else {
      throw e;
    }
  }
});
