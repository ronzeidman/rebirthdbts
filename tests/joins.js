import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result, pks;


it('Init for `joins.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).table(tableName).insert([{val:1}, {val: 2}, {val: 3}]).run();
    pks = result.generated_keys;
    assert.equal(result.inserted, 3)

    result = await r.db(dbName).table(tableName).indexCreate("val").run();
    result = await r.db(dbName).table(tableName).indexWait("val").run();
    assert(result);


  }
  catch(e) {
    throw e;
  }
})

it('`innerJoin` should return -- array-array', async () => {
  try {
    result = await r.expr([1,2,3]).innerJoin(r.expr([1,2,3]), function(left, right) { return left.eq(right) }).run();
    assert.deepEqual(result, [{left:1, right:1}, {left:2, right: 2}, {left:3, right: 3}]);

  }
  catch(e) {
    throw e;
  }
})
it('`innerJoin` should return -- array-stream', async () => {
  try {
    result = await r.expr([1,2,3]).innerJoin(r.db(dbName).table(tableName), function(left, right) { return left.eq(right("val")) }).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})
it('`innerJoin` should return -- stream-stream', async () => {
  try {
    result = await r.db(dbName).table(tableName).innerJoin(r.db(dbName).table(tableName), function(left, right) { return left.eq(right) }).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})
it('`innerJoin` should throw if no sequence', async () => {
  try {
    result = await r.db(dbName).table(tableName).innerJoin().run();
  }
  catch(e) {
    if (e.message === "`innerJoin` takes 2 arguments, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`innerJoin` should throw if no predicate', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).innerJoin(r.expr([1,2,3])).run();
  }
  catch(e) {
    if (e.message === "`innerJoin` takes 2 arguments, 1 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})


it('`outerJoin` should return -- array-array', async () => {
  try {
    result = await r.expr([1,2,3]).outerJoin(r.expr([1,2,3]), function(left, right) { return left.eq(right) }).run();
    assert.deepEqual(result, [{left:1, right:1}, {left:2, right: 2}, {left:3, right: 3}]);

  }
  catch(e) {
    throw e;
  }
})
it('`outerJoin` should return -- array-stream - 1', async () => {
  try {
    result = await r.expr([1,2,3,4]).outerJoin(r.db(dbName).table(tableName), function(left, right) { return left.eq(right("val")) }).run();
    assert.equal(result.length, 4);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})

it('`outerJoin` should return -- array-stream - 2', async () => {
  try {
    result = await r.expr([1,2,3,4]).outerJoin(r.db(dbName).table(tableName), function(left, right) { return left.eq(right("val")) }).run();
    assert.equal(result.length, 4);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);
    assert(result[3].left);
    assert.equal(result[3].right, undefined);


  }
  catch(e) {
    throw e;
  }
})
it('`outerJoin` should return -- stream-stream', async () => {
  try {
    result = await r.db(dbName).table(tableName).outerJoin(r.db(dbName).table(tableName), function(left, right) { return left.eq(right) }).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})
it('`outerJoin` should throw if no sequence', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).outerJoin().run();
  }
  catch(e) {
    if (e.message === "`outerJoin` takes 2 arguments, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`outerJoin` should throw if no predicate', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).outerJoin(r.expr([1,2,3])).run();
  }
  catch(e) {
    if (e.message === "`outerJoin` takes 2 arguments, 1 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})


it('`eqJoin` should return -- pk -- array-stream - function', async () => {
  try {
    let result: any = await r.expr(pks).eqJoin(function(doc) { return doc; }, r.db(dbName).table(tableName)).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})
it('`eqJoin` should return -- pk -- array-stream - row => row', async () => {
  try {
    let result: any = await r.expr(pks).eqJoin(row => row, r.db(dbName).table(tableName)).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})

it('`eqJoin` should return -- secondary index -- array-stream - row => row', async () => {
  try {
    let result: any = await r.expr([1,2,3]).eqJoin(row => row, r.db(dbName).table(tableName), {index: "val"}).run();
    assert.equal(result.length, 3);
    assert(result[0].left);
    assert(result[0].right);
    assert(result[1].left);
    assert(result[1].right);
    assert(result[2].left);
    assert(result[2].right);


  }
  catch(e) {
    throw e;
  }
})
it('`eqJoin` should throw if no argument', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).eqJoin().run();
  }
  catch(e) {
    if (e.message === "`eqJoin` takes at least 2 arguments, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`eqJoin` should throw with a non valid key', async () => {
  try {
    let result: any = await r.expr([1,2,3]).eqJoin(row => row, r.db(dbName).table(tableName), {nonValidKey: "val"}).run();
  }
  catch(e) {
    if (e.message === "Unrecognized option `nonValidKey` in `eqJoin` after:\nr.expr([1, 2, 3])\nAvailable options are index <string>, ordered <boolean>") {

    }
    else {
      throw e;
    }
  }
})

it('`eqJoin` should throw if no sequence', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).eqJoin("id").run();
  }
  catch(e) {
    if (e.message === "`eqJoin` takes at least 2 arguments, 1 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`eqJoin` should throw if too many arguments', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).eqJoin(1, 1, 1, 1, 1).run();
  }
  catch(e) {
    if (e.message === "`eqJoin` takes at most 3 arguments, 5 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})



it('`zip` should zip stuff', async () => {
  try {
    let result: any = await r.expr(pks).eqJoin(function(doc) { return doc; }, r.db(dbName).table(tableName)).zip().run();
    assert.equal(result.length, 3);
    assert.equal(result[0].left, undefined);


  }
  catch(e) {
    throw e;
  }
})
