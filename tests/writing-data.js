import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;


it('Init for `writing-data.js`', async () => {
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
it('`insert` should work - single insert`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({}).run();
    assert.equal(result.inserted, 1);

    result = await r.db(dbName).table(tableName).insert(eval('['+new Array(100).join('{}, ')+'{}]')).run();
    assert.equal(result.inserted, 100);



  }
  catch(e) {
    throw e;
  }
})


it('`insert` should work - batch insert 1`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert([{}, {}]).run();
    assert.equal(result.inserted, 2);


  }
  catch(e) {
    throw e;
  }
})

it('`insert` should work - batch insert 2`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert(eval('['+new Array(100).join('{}, ')+'{}]')).run();
    assert.equal(result.inserted, 100);


  }
  catch(e) {
    throw e;
  }
})

it('`insert` should work - with returnChanges true`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({}, {returnChanges: true}).run();
    assert.equal(result.inserted, 1);
    assert(result.changes[0].new_val);
    assert.equal(result.changes[0].old_val, null);


  }
  catch(e) {
    throw e;
  }
})


it('`insert` should work - with returnChanges false`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({}, {returnChanges: false}).run();
    assert.equal(result.inserted, 1);
    assert.equal(result.changes, undefined);
    assert.equal(result.changes, undefined);


  }
  catch(e) {
    throw e;
  }
})
it('`insert` should work - with durability soft`', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({}, {durability: 'soft'}).run();
    assert.equal(result.inserted, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`insert` should work - with durability hard`', async () => {
  try {
    result = await r.db(dbName).table(tableName).insert({}, {durability: 'hard'}).run();
    assert.equal(result.inserted, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`insert` should work - testing conflict`', async () => {
  try {
    result = await r.db(dbName).table(tableName).insert({}, {conflict: 'update'}).run();
    assert.equal(result.inserted, 1);

    let pk = result.generated_keys[0];

    result = await r.db(dbName).table(tableName).insert({id: pk, val:1}, {conflict: 'update'}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).insert({id: pk, val:2}, {conflict: 'replace'}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).insert({id: pk, val:3}, {conflict: 'error'}).run();
    assert.equal(result.errors, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`insert` should throw if no argument is given', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).insert().run();
  }
  catch(e) {
    if (e.message === "`insert` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`insert` work with dates - 1', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({name: "Michel", age: 27, birthdate: new Date()}).run()
    assert.deepEqual(result.inserted, 1);

  }
  catch(e) {
    throw e;
  }
})
it('`insert` work with dates - 2', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert([{name: "Michel", age: 27, birthdate: new Date()}, {name: "Sophie", age: 23}]).run()
    assert.deepEqual(result.inserted, 2);

  }
  catch(e) {
    throw e;
  }
})
it('`insert` work with dates - 3', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({
      field: 'test',
      field2: { nested: 'test' },
      date: new Date()
    }).run()
    assert.deepEqual(result.inserted, 1);

  }
  catch(e) {
    throw e;
  }
})
it('`insert` work with dates - 4', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).insert({
      field: 'test',
      field2: { nested: 'test' },
      date: r.now()
    }).run()
    assert.deepEqual(result.inserted, 1);

  }
  catch(e) {
    throw e;
  }
})

it('`insert` should throw if non valid option', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).insert({}, {nonValidKey: true}).run();
  }
  catch(e) {
    if (e.message === 'Unrecognized option `nonValidKey` in `insert` after:\nr.db("'+dbName+'").table("'+tableName+'")\nAvailable options are returnChanges <bool>, durability <string>, conflict <string>') {
      return;
    }
    else {
      throw e;
    }
  }
})

it('`insert` with a conflict method', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).insert({
      count: 7
    }).run();
    let savedId = result.generated_keys[0];
    let result: any = await r.db(dbName).table(tableName).insert({
      id: savedId,
      count: 10
    }, {
      conflict: function(id, oldDoc, newDoc) {
        return newDoc.merge({
          count: newDoc('count').add(oldDoc('count'))
        })
      }
    }).run();
    result = await r.db(dbName).table(tableName).get(savedId)
    assert.deepEqual(result, {
      id: savedId,
      count: 17
    })

  }
  catch(e) {
    throw e;
  }
})

it('`replace` should throw if no argument is given', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).replace().run();
  }
  catch(e) {
    if (e.message === "`replace` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`replace` should throw if non valid option', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).replace({}, {nonValidKey: true}).run();
  }
  catch(e) {
    if (e.message === 'Unrecognized option `nonValidKey` in `replace` after:\nr.db("'+dbName+'").table("'+tableName+'")\nAvailable options are returnChanges <bool>, durability <string>, nonAtomic <bool>') {
      return;
    }
    else {
      throw e;
    }
  }
})

it('`delete` should work`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result.deleted > 0);

    result = await r.db(dbName).table(tableName).delete().run();
    assert.equal(result.deleted, 0);


  }
  catch(e) {
    throw e;
  }
})

it('`delete` should work -- soft durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).delete({durability: "soft"}).run();
    assert.equal(result.deleted, 1);


    result = await r.db(dbName).table(tableName).insert({}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).delete().run();
    assert.equal(result.deleted, 1);


  }
  catch(e) {
    throw e;
  }
})



it('`delete` should work -- hard durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).delete({durability: "hard"}).run();
    assert.equal(result.deleted, 1);


    result = await r.db(dbName).table(tableName).insert({}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).delete().run();
    assert.equal(result.deleted, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`delete` should throw if non valid option', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).delete({nonValidKey: true}).run();
  }
  catch(e) {
    if (e.message === 'Unrecognized option `nonValidKey` in `delete` after:\nr.db("'+dbName+'").table("'+tableName+'")\nAvailable options are returnChanges <bool>, durability <string>') {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`update` should work - point update`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).update({foo: "bar"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})

it('`update` should work - range update`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert([{id: 1}, {id: 2}]).run();
    assert(result);

    result = await r.db(dbName).table(tableName).update({foo: "bar"}).run();
    assert.equal(result.replaced, 2);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});
    result = await r.db(dbName).table(tableName).get(2).run();
    assert.deepEqual(result, {id: 2, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})

it('`update` should work - soft durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).update({foo: "bar"}, {durability: "soft"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`update` should work - hard durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).update({foo: "bar"}, {durability: "hard"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`update` should work - returnChanges true', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).update({foo: "bar"}, {returnChanges: true}).run();
    assert.equal(result.replaced, 1);
    assert.deepEqual(result.changes[0].new_val, {id: 1, foo: "bar"});
    assert.deepEqual(result.changes[0].old_val, {id: 1});

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`update` should work - returnChanges false`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).update({foo: "bar"}, {returnChanges: false}).run();
    assert.equal(result.replaced, 1);
    assert.equal(result.changes, undefined);
    assert.equal(result.changes, undefined);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`update` should throw if no argument is given', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).update().run();
  }
  catch(e) {
    if (e.message === "`update` takes at least 1 argument, 0 provided after:\nr.db(\""+dbName+"\").table(\""+tableName+"\")") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`update` should throw if non valid option', async () => {
  try{
    let result: any = await r.db(dbName).table(tableName).update({}, {nonValidKey: true}).run();
  }
  catch(e) {
    if (e.message === 'Unrecognized option `nonValidKey` in `update` after:\nr.db("'+dbName+'").table("'+tableName+'")\nAvailable options are returnChanges <bool>, durability <string>, nonAtomic <bool>') {
      return;
    }
    else {
      throw e;
    }
  }
})

it('`replace` should work - point replace`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).replace({id: 1, foo: "bar"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})

it('`replace` should work - range replace`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert([{id: 1}, {id: 2}]).run();
    assert(result);

    result = await r.db(dbName).table(tableName).replace(row => row.merge({foo: "bar"})).run();
    assert.equal(result.replaced, 2);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});

    result = await r.db(dbName).table(tableName).get(2).run();
    assert.deepEqual(result, {id: 2, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})

it('`replace` should work - soft durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).replace({id: 1, foo: "bar"}, {durability: "soft"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`replace` should work - hard durability`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).replace({id: 1, foo: "bar"}, {durability: "hard"}).run();
    assert.equal(result.replaced, 1);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})

it('`replace` should work - returnChanges true', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).replace({id: 1, foo: "bar"}, {returnChanges: true}).run();
    assert.equal(result.replaced, 1);
    assert.deepEqual(result.changes[0].new_val, {id: 1, foo: "bar"});
    assert.deepEqual(result.changes[0].old_val, {id: 1});

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
it('`replace` should work - returnChanges false`', async () => {
  try {
    result = await r.db(dbName).table(tableName).delete().run();
    assert(result);
    result = await r.db(dbName).table(tableName).insert({id: 1}).run();
    assert(result);

    result = await r.db(dbName).table(tableName).get(1).replace({id: 1, foo: "bar"}, {returnChanges: false}).run();
    assert.equal(result.replaced, 1);
    assert.equal(result.changes, undefined);
    assert.equal(result.changes, undefined);

    result = await r.db(dbName).table(tableName).get(1).run();
    assert.deepEqual(result, {id: 1, foo: "bar"});


  }
  catch(e) {
    throw e;
  }
})
