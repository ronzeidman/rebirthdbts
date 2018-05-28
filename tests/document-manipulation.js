import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;

it('Init for `document-manipulation.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);


  }
  catch(e) {
    throw e;
  }
})

it('`row => row` should work - 1', async () => {
  try {
    result = await r.expr([1,2,3]).map(row => row).run();
    assert.deepEqual(result, [1,2,3]);
    return;
  }
  catch(e) {
    throw e;
  }
})

it('`row => row` should work - 2', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({}).run();
    assert.equal(result.inserted, 1);

    result = await r.db(dbName).table(tableName).update({idCopyUpdate: row => row("id")}).run();
    assert.equal(result.replaced, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`row => row` should work - 3', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).replace(row => row).run();
    assert.equal(result.replaced, 0);


  }
  catch(e) {
    throw e;
  }
})
it('`row => row` should work - 4', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).replace(function(doc) {
      return doc.merge({idCopyReplace: doc("id")})
    }).run();
    assert.equal(result.replaced, 1);


  }
  catch(e) {
    throw e;
  }
})

it('`row => row` should work - 5', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).delete().run();
    assert.equal(result.deleted, 1);


  }
  catch(e) {
    throw e;
  }
})

it('`pluck` should work', async () => {
  try {
    let result: any = await r.expr({a: 0, b: 1, c: 2}).pluck("a", "b").run();
    assert.deepEqual(result, {a: 0, b: 1});

    result = await r.expr([{a: 0, b: 1, c: 2}, {a: 0, b: 10, c: 20}]).pluck("a", "b").run();
    assert.deepEqual(result, [{a: 0, b: 1}, {a: 0, b: 10}]);


  }
  catch(e) {
    throw e;
  }
})
it('`pluck` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).pluck().run();
  }
  catch(e) {
    if (e.message === "`pluck` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})

it('`without` should work', async () => {
  try {
    let result: any = await r.expr({a: 0, b: 1, c: 2}).without("c").run();
    assert.deepEqual(result, {a: 0, b: 1});

    result = await r.expr([{a: 0, b: 1, c: 2}, {a: 0, b: 10, c: 20}]).without("a", "c").run();
    assert.deepEqual(result, [{b: 1}, {b: 10}]);


  }
  catch(e) {
    throw e;
  }
})
it('`without` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).without().run();
  }
  catch(e) {
    if (e.message === "`without` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`merge` should work', async () => {
  try {
    let result: any = await r.expr({a: 0}).merge({b: 1}).run();
    assert.deepEqual(result, {a: 0, b: 1});

    result = await r.expr([{a: 0}, {a: 1}, {a: 2}]).merge({b: 1}).run();
    assert.deepEqual(result, [{a: 0, b: 1}, {a: 1, b: 1}, {a: 2, b: 1}]);

    result = await r.expr({a: 0, c: {l: "tt"}}).merge({b: {c: {d: {e: "fff"}}, k: "pp"}}).run();
    assert.deepEqual(result, {a: 0, b: {c: {d: {e: "fff"}}, k: "pp"}, c: {l:"tt"}});

    result = await r.expr({a: 1}).merge({date: r.now()}).run();
    assert.equal(result.a, 1)
    assert(result.date instanceof Date)

    result = await r.expr({a: 1}).merge({nested: row => row}, {b: 2}).run();
    assert.deepEqual(result, {a: 1, nested: {a: 1}, b: 2})


  }
  catch(e) {
    throw e;
  }
})
it('`merge` should take an anonymous function', async () => {
  try {
    let result: any = await r.expr({a: 0}).merge(function(doc) {
      return {b: doc("a").add(1)}
    }).run();
    assert.deepEqual(result, {a: 0, b: 1});

    result = await r.expr({a: 0}).merge({
      b: row => row("a").add(1)
    }).run();
    assert.deepEqual(result, {a: 0, b: 1});


  }
  catch(e) {
    throw e;
  }
})

it('`literal` should work', async () => {
  try {
    let data = r.expr({a: {b: 1}}).merge({a: r.literal({c: 2})})._self
    let result: any = await r.expr({a: {b: 1}}).merge({a: r.literal({c: 2})}).run();
    assert.deepEqual(result, {a: {c: 2}});


  }
  catch(e) {
    throw e;
  }
})
it('`literal` is not defined after a term', async () => {
  try {
    result = await r.expr(1).literal("foo").run();
  }
  catch(e) {
    if (e.message === "`literal` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`merge` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).merge().run();
  }
  catch(e) {
    if (e.message === "`merge` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`literal` should work with no argument', async () => {
  try {
    let result: any = await r.expr({foo: 'bar'}).merge({foo: r.literal()}).run();
    assert.deepEqual(result, {});

  }
  catch(e) {
    throw e;
  }
})
it('`append` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).append(4).run();
    assert.deepEqual(result, [1,2,3,4]);


  }
  catch(e) {
    throw e;
  }
})
it('`append` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).append().run();
  }
  catch(e) {
    if (e.message === "`append` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`prepend` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).prepend(4).run();
    assert.deepEqual(result, [4,1,2,3]);


  }
  catch(e) {
    throw e;
  }
})
it('`prepend` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).prepend().run();
  }
  catch(e) {
    if (e.message === "`prepend` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`difference` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).prepend(4).run();
    assert.deepEqual(result, [4,1,2,3]);


  }
  catch(e) {
    throw e;
  }
})
it('`difference` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).difference().run();
  }
  catch(e) {
    if (e.message === "`difference` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`setInsert` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).setInsert(4).run();
    assert.deepEqual(result, [1,2,3,4]);

    result = await r.expr([1,2,3]).setInsert(2).run();
    assert.deepEqual(result, [1,2,3]);


  }
  catch(e) {
    throw e;
  }
})
it('`setInsert` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).setInsert().run();
  }
  catch(e) {
    if (e.message === "`setInsert` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})
it('`setUnion` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).setUnion([2,4]).run();
    assert.deepEqual(result, [1,2,3,4]);


  }
  catch(e) {
    throw e;
  }
})
it('`setUnion` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).setUnion().run();
  }
  catch(e) {
    if (e.message === "`setUnion` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})

it('`setIntersection` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).setIntersection([2,4]).run();
    assert.deepEqual(result, [2]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`setIntersection` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).setIntersection().run();
  }
  catch(e) {
    if (e.message === "`setIntersection` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})

it('`setDifference` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3]).setDifference([2,4]).run();
    assert.deepEqual(result, [1,3]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`setDifference` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).setDifference().run();
  }
  catch(e) {
    if (e.message === "`setDifference` takes 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {

    }
    else {
      throw e;
    }
  }
})

it('`getField` should work', async () => {
  try {
    let result: any = await r.expr({a:0, b:1})("a").run();
    assert.equal(result, 0);

    result = await r.expr({a:0, b:1}).getField("a").run();
    assert.equal(result, 0);

    result = await r.expr([{a:0, b:1}, {a:1}])("a").run();
    assert.deepEqual(result, [0, 1]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`(...)` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName)().run();
  }
  catch(e) {
    if (e.message === "`(...)` takes 1 argument, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`getField` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).getField().run();
  }
  catch(e) {
    if (e.message === '`(...)` takes 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`hasFields` should work', async () => {
  try {
    let result: any = await r.expr([{a: 0, b: 1, c: 2}, {a: 0, b: 10, c: 20}, {b:1, c:3}]).hasFields("a", "c").run();
    assert.deepEqual(result, [{a: 0, b: 1, c: 2}, {a: 0, b: 10, c: 20}]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`hasFields` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).hasFields().run();
  }
  catch(e) {
    if (e.message === '`hasFields` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})

it('`insertAt` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3,4]).insertAt(0, 2).run();
    assert.deepEqual(result, [2,1,2,3,4]);

    result = await r.expr([1,2,3,4]).insertAt(3, 2).run();
    assert.deepEqual(result, [1,2,3,2,4]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`insertAt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insertAt().run();
  }
  catch(e) {
    if (e.message === '`insertAt` takes 2 arguments, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`spliceAt` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3,4]).spliceAt(1, [9, 9]).run();
    assert.deepEqual(result, [1,9,9,2,3,4]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`spliceAt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).spliceAt().run();
  }
  catch(e) {
    if (e.message === '`spliceAt` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`deleteAt` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3,4]).deleteAt(1).run();
    assert.deepEqual(result, [1,3,4]);

    result = await r.expr([1,2,3,4]).deleteAt(1, 3).run();
    assert.deepEqual(result, [1,4]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`deleteAt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).deleteAt().run();
  }
  catch(e) {
    if (e.message === '`deleteAt` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`deleteAt` should throw if too many arguments', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).deleteAt(1, 1, 1, 1).run();
  }
  catch(e) {
    if (e.message === '`deleteAt` takes at most 2 arguments, 4 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`changeAt` should work', async () => {
  try {
    let result: any = await r.expr([1,2,3,4]).changeAt(1, 3).run();
    assert.deepEqual(result, [1,3,3,4]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`changeAt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).changeAt().run();
  }
  catch(e) {
    if (e.message === '`changeAt` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`keys` should work', async () => {
  try {
    let result: any = await r.expr({a:0, b:1, c:2}).keys().orderBy(row => row).run();
    assert.deepEqual(result, ["a", "b", "c"]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`keys` throw on a string', async () => {
  try {
    let result: any = await r.expr("hello").keys().orderBy(row => row).run();
  }
  catch(e) {
    if (e.message.match(/^Cannot call `keys` on objects of type `STRING` in/)) {

    }
    else {
      console.log(e);
      throw e;
    }
  }
})
it('`values` should work', async () => {
  try {
    let result: any = await r.expr({a:0, b:1, c:2}).values().orderBy(row => row).run();
    assert.deepEqual(result, [0, 1, 2]);

    return;
  }
  catch(e) {
    throw e;
  }
})

it('`object` should work', async () => {
  try {
    let result: any = await r.object("a", 1, r.expr("2"), "foo").run();
    assert.deepEqual(result, {"a": 1, "2": "foo"});

    return;
  }
  catch(e) {
    throw e;
  }
})
