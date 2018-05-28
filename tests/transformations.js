import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result, pks;


it('Init for `transformations.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).table(tableName).insert(eval('['+new Array(100).join('{}, ')+'{}]')).run();
    assert.equal(result.inserted, 100);

    result = await r.db(dbName).table(tableName).update({val: r.js("Math.random()")}, {nonAtomic: true}).run();
    result = await r.db(dbName).table(tableName).indexCreate('val').run();
    result = await r.db(dbName).table(tableName).indexWait('val').run();

    pks = result.generated_keys;


  }
  catch(e) {
    throw e;
  }
})

it('`map` should work on array -- row => row', async () => {
  try {
    result = await r.expr([1,2,3]).map(row => row).run();
    assert.deepEqual(result, [1,2,3]);


    result = await r.expr([1,2,3]).map(row => row.add(1)).run();
    assert.deepEqual(result, [2, 3, 4]);

  }
  catch(e) {
    throw e;
  }
})
it('`map` should work on array -- function', async () => {
  try {
    result = await r.expr([1,2,3]).map(function(doc) { return doc }).run();
    assert.deepEqual(result, [1,2,3]);

    result = await r.expr([1,2,3]).map(function(doc) { return doc.add(2)}).run();
    assert.deepEqual(result, [3, 4, 5]);


  }
  catch(e) {
    throw e;
  }
})
it('`map` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).map().run();
  }
  catch(e) {
    if (e.message.match(/^`map` takes at least 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})

it('`withFields` should work on array -- single field', async () => {
  try {
    result = await r.expr([{a: 0, b: 1, c: 2}, {a: 4, b: 4, c: 5}, {a:9, b:2, c:0}]).withFields("a").run();
    assert.deepEqual(result, [{a: 0}, {a: 4}, {a: 9}]);


  }
  catch(e) {
    throw e;
  }
})
it('`withFields` should work on array -- multiple field', async () => {
  try {
    result = await r.expr([{a: 0, b: 1, c: 2}, {a: 4, b: 4, c: 5}, {a:9, b:2, c:0}]).withFields("a", "c").run();
    assert.deepEqual(result, [{a: 0, c: 2}, {a: 4, c: 5}, {a:9, c:0}]);


  }
  catch(e) {
    throw e;
  }
})
it('`withFields` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).withFields().run();
  }
  catch(e) {
    if (e.message.match(/^`withFields` takes at least 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`concatMap` should work on array -- function', async () => {
  try {
    result = await r.expr([[1, 2], [3], [4]]).concatMap(function(doc) { return doc}).run();
    assert.deepEqual(result, [1, 2, 3, 4]);


  }
  catch(e) {
    throw e;
  }
})
it('`concatMap` should work on array -- row => row', async () => {
  try {
    result = await r.expr([[1, 2], [3], [4]]).concatMap(row => row).run();
    assert.deepEqual(result, [1, 2, 3, 4]);


  }
  catch(e) {
    throw e;
  }
})
it('`concatMap` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).concatMap().run();
  }
  catch(e) {
    if (e.message.match(/^`concatMap` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})


it('`orderBy` should work on array -- string', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy("a").run();
    assert.deepEqual(result, [{a:0}, {a:10}, {a:23}, {a:100}]);


  }
  catch(e) {
    throw e;
  }
})

it('`orderBy` should work on array -- row => row', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy(row => row("a")).run();
    assert.deepEqual(result, [{a:0}, {a:10}, {a:23}, {a:100}]);


  }
  catch(e) {
    throw e;
  }
})

it('`orderBy` should work on a table -- pk', async () => {
  try {
    result = await r.db(dbName).table(tableName).orderBy({index: "id"}).run();
    for(let i=0; i<result.length-1; i++) {
      assert(result[i].id < result[i+1].id);
    }


  }
  catch(e) {
    throw e;
  }
})
it('`orderBy` should work on a table -- secondary', async () => {
  try {
    result = await r.db(dbName).table(tableName).orderBy({index: "val"}).run();
    for(let i=0; i<result.length-1; i++) {
      assert(result[i].val < result[i+1].val);
    }


  }
  catch(e) {
    throw e;
  }
})
it('`orderBy` should work on a two fields', async () => {
  try {
    let dbName = uuid();
    let tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.deepEqual(result.dbs_created, 1);

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).table(tableName).insert([{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")},{a: r.js("Math.random()")}]).run();
    assert.deepEqual(result.inserted, 98);

    result = await r.db(dbName).table(tableName).orderBy("id", "a").run();
    assert(Array.isArray(result));
    assert(result[0].id<result[1].id);


  }
  catch(e) {
    throw e;
  }
})
it('`orderBy` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).orderBy().run();
  }
  catch(e) {
    if (e.message.match(/^`orderBy` takes at least 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`orderBy` should not wrap on r.asc', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy(r.asc(row => row("a"))).run();
    assert.deepEqual(result, [{a:0}, {a:10}, {a:23}, {a:100}]);


  }
  catch(e) {
    console.log(e);
    throw e;
  }
})

it('`orderBy` should not wrap on r.desc', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy(r.desc(row => row("a"))).run();
    assert.deepEqual(result, [{a:100}, {a:23}, {a:10}, {a:0} ]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})
it('r.desc should work', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy(r.desc("a")).run();
    assert.deepEqual(result, [{a:100}, {a:23}, {a:10}, {a:0} ]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})
it('r.asc should work', async () => {
  try {
    result = await r.expr([{a:23}, {a:10}, {a:0}, {a:100}]).orderBy(r.asc("a")).run();
    assert.deepEqual(result, [{a:0}, {a:10}, {a:23}, {a:100}]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})



it('`desc` is not defined after a term', async () => {
  try {
    result = await r.expr(1).desc("foo").run();
  }
  catch(e) {
    if (e.message === "`desc` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`asc` is not defined after a term', async () => {
  try {
    result = await r.expr(1).asc("foo").run();
  }
  catch(e) {
    if (e.message === "`asc` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})

it('`skip` should work', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).skip(3).run();
    assert.deepEqual(result, [3, 4, 5, 6, 7, 8, 9]);


  }
  catch(e) {
    throw e;
  }
})
it('`skip` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).skip().run();
  }
  catch(e) {
    if (e.message.match(/^`skip` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})

it('`limit` should work', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).limit(3).run();
    assert.deepEqual(result, [0, 1, 2]);


  }
  catch(e) {
    throw e;
  }
})
it('`limit` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).limit().run();
  }
  catch(e) {
    if (e.message.match(/^`limit` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`slice` should work', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(3, 5).run();
    assert.deepEqual(result, [3, 4]);


  }
  catch(e) {
    throw e;
  }
})
it('`slice` should handle options and optional end', async () => {
  try {
    let result: any = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(3).run();
    assert.deepEqual(result, [3, 4, 5, 6, 7, 8, 9]);

    let result: any = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(3, {leftBound: "open"}).run();
    assert.deepEqual(result, [4, 5, 6, 7, 8, 9]);

    let result: any = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(3, 5, {leftBound: "open"}).run();
    assert.deepEqual(result, [4]);


  }
  catch(e) {
    throw e;
  }
})

it('`slice` should work -- with options', async () => {
  try {
    result = await r.expr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22, 23]).slice(5, 10, {rightBound:'closed'}).run();
    assert.deepEqual(result, [5, 6, 7, 8, 9, 10]);

    result = await r.expr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22, 23]).slice(5, 10, {rightBound:'open'}).run();
    assert.deepEqual(result, [5, 6, 7, 8, 9]);

    result = await r.expr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22, 23]).slice(5, 10, {leftBound:'open'}).run();
    assert.deepEqual(result, [6, 7, 8, 9]);

    result = await r.expr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22, 23]).slice(5, 10, {leftBound:'closed'}).run();
    assert.deepEqual(result, [5, 6, 7, 8, 9]);

    result = await r.expr([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22, 23]).slice(5, 10, {leftBound:'closed', rightBound: 'closed'}).run();
    assert.deepEqual(result, [5, 6, 7, 8, 9, 10]);


  }
  catch(e) {
    throw e;
  }
})
it('`slice` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).slice().run();
  }
  catch(e) {
    if (e.message.match(/^`slice` takes at least 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`nth` should work', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).nth(3).run();
    assert(result, 3);


  }
  catch(e) {
    throw e;
  }
})
it('`nth` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).nth().run();
  }
  catch(e) {
    if (e.message.match(/^`nth` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`indexesOf` should work - datum', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).nth(3).run();
    assert(result, 3);


  }
  catch(e) {
    throw e;
  }
})

it('`indexesOf` should work - row => row', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).indexesOf(row => row.eq(3)).run();
    assert.equal(result, 3);


  }
  catch(e) {
    throw e;
  }
})
it('`indexesOf` should work - function', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).indexesOf(function(doc) { return doc.eq(3)}).run();
    assert.equal(result, 3);


  }
  catch(e) {
    throw e;
  }
})
it('`indexesOf` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).indexesOf().run();
  }
  catch(e) {
    if (e.message.match(/^`indexesOf` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
it('`isEmpty` should work', async () => {
  try {
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).isEmpty().run();
    assert.equal(result, false);

    result = await r.expr([]).isEmpty().run();
    assert.equal(result, true);


  }
  catch(e) {
    throw e;
  }
})

it('`union` should work - 1', async () => {
  try{
    result = await r.expr([0, 1, 2]).union([3, 4, 5]).run();
    assert.deepEqual(result.length, 6);
    for(let i=0; i<6; i++) {
      assert(result.indexOf(i) >= 0);
    }
    return;
  }
  catch(e) {
    throw e;
  }
})
it('`union` should work - 2', async () => {
  try{
    result = await r.union([0, 1, 2], [3, 4, 5], [6, 7]).run();
    assert.deepEqual(result.length, 8);
    for(let i=0; i<8; i++) {
      assert(result.indexOf(i) >= 0);
    }
    return;
  }
  catch(e) {
    throw e;
  }
})
it('`union` should work - 3', async () => {
  try{
    result = await r.union().run();
    assert.deepEqual(result, []);
    return;
  }
  catch(e) {
    throw e;
  }
})
it('`union` should work with interleave - 1', async () => {
  try{
    result = await r.expr([0, 1, 2]).union([3, 4, 5], {interleave: false}).run();
    assert.deepEqual(result, [0, 1, 2, 3, 4, 5]);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`union` should work with interleave - 1', async () => {
  try{
    result = await r.expr([{name: 'Michel'}, {name: 'Sophie'}, {name: 'Laurent'}]).orderBy('name')
      .union(r.expr([{name: 'Moo'}, {name: 'Bar'}]).orderBy('name'), {interleave: 'name'}).run();
    assert.deepEqual(result, [
        {name: 'Bar'},
        {name: 'Laurent'},
        {name: 'Michel'},
        {name: 'Moo'},
        {name: 'Sophie'}
    ]);

    return;
  }
  catch(e) {
    throw e;
  }
})

it('`sample` should work', async () => {
  try{
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).sample(2).run();
    assert.equal(result.length, 2);

    return;
  }
  catch(e) {
    throw e;
  }
})
it('`sample` should throw if given -1', async () => {
  try{
    result = await r.expr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).sample(-1).run();
  }
  catch(e) {
    if (e.message.match("Number of items to sample must be non-negative, got `-1`")) {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`sample` should throw if no argument has been passed', async () => {
  try {
    result = await r.db(dbName).table(tableName).sample().run();
  }
  catch(e) {
    if (e.message.match(/^`sample` takes 1 argument, 0 provided after/) ){
      return;
    }
    else {
      throw e;
    }
  }
})
