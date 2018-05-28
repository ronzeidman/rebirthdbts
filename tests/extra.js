import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;

it('Init for `extra.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid(); // Big table to test partial sequence

    result = await r.dbCreate(dbName).run()
    assert.equal(result.dbs_created, 1);
    //await r.db(dbName).wait().run()
    result = await r.db(dbName).tableCreate(tableName)('tables_created').run();
    assert.deepEqual(result, 1);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})
it('Change the default database on the fly in run', async () => {
  try {
    result = await r.tableList().run({db: dbName})
    assert.deepEqual(result, [tableName]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})

it('Anonymous function should throw if they return undefined', async () => {
  try {
    r.expr(1).do(function() {});
  }
  catch(e) {
    if (e.message === "Anonymous function returned `undefined`. Did you forget a `return`? In:\nfunction () {}.") {
      return;
    }
    else {
      throw e;
    }
  }
})

it('toString should work', async () => {
  try {
    assert.equal(r.expr(1).add(2).toString(), "r.expr(1).add(2)");
    assert.equal(r.expr(1).toString(), "r.expr(1)");

  }
  catch(e) {
    throw e;
  }
})

it('await a query should work - 1', async () => {
  try {
    let result: any = await r.expr(1);
    assert.equal(result, 1);

    let result: any = await r.expr(1).add(3);
    assert.equal(result, 4);


  }
  catch(e) {
    throw e;
  }
})
it('await a query should work - 2', async () => {
  try {
    let result: any = await r.expr(1).add("foo");
    throw new Error("Was expecting an error");
  }
  catch(e) {
    if (e.message.match(/Expected type NUMBER but found STRING/)) {

    }
    else {
      throw e;
    }
  }
})
