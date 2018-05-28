import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;


it('Init for `manipulating-tables.js`', async () => {
  try {
    dbName = uuid(); // export to the global scope
    let result: any = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);


  }
  catch(e) {
    throw e;
  }
})

it('`tableList` should return a cursor', async () => {
  try {
    result = await r.db(dbName).tableList().run();
    assert(Array.isArray(result));

  }
  catch(e) {
    throw e;
  }
})

it('`tableList` should show the table we created', async () => {
  try {
    tableName = uuid(); // export to the global scope

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).tableList().run();
    assert(Array.isArray(result));

    let found = false;
    for(let i=0; i<result.length; i++) {
      if (result[i] === tableName) {
        found = true;
        break;
      }
    };

    if (found === false) {
      throw new Error("Previously created table not found.");
    }
    else {

    }
  }
  catch(e) {
    throw e;
  }
})


it('`tableCreate` should create a table', async () => {
  try {
    tableName = uuid(); // export to the global scope

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`tableCreate` should create a table -- primaryKey', async () => {
  try {
    tableName = uuid();

    result = await r.db(dbName).tableCreate(tableName, {primaryKey: "foo"}).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).table(tableName).info().run();
    assert(result.primary_key, "foo");


  }
  catch(e) {
    throw e;
  }
})
it('`tableCreate` should create a table -- all args', async () => {
  try {
    tableName = uuid();

    result = await r.db(dbName).tableCreate(tableName, {durability: "soft", primaryKey: "foo"}).run();
    assert.equal(result.tables_created, 1); // We can't really check other parameters...

    result = await r.db(dbName).table(tableName).info().run();
    assert(result.primary_key, "foo");


  }
  catch(e) {
    throw e;
  }
})
it('`tableCreate` should throw -- non valid args', async () => {
  try {
    tableName = uuid();

    result = await r.db(dbName).tableCreate(tableName, {nonValidArg: true}).run();
  }
  catch(e) {
    if (e.message.match(/^Unrecognized option `nonValidArg` in `tableCreate`/)) {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`tableCreate` should throw if no argument is given', async () => {
  try {
    result = await r.db(dbName).tableCreate().run();
  }
  catch(e) {
    if (e.message === '`tableCreate` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'")') {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`tableCreate` should throw is the name contains special char', async () => {
  try {
    result = await r.db(dbName).tableCreate("-_-").run();
  }
  catch(e) {
    if (e.message.match(/Table name `-_-` invalid \(Use A-Za-z0-9_ only\)/)) {  }
    else { throw e; }
  }
})



it('`tableDrop` should drop a table', async () => {
  try {
    tableName = uuid();

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).tableList().run();

    result = await r.db(dbName).tableDrop(tableName).run();
    assert.equal(result.tables_dropped, 1);

    result = await r.db(dbName).tableList().run();
    assert(Array.isArray(result));

    let found = false;
    for(let i=0; i<result.length; i++) {
      if (result[i] === tableName) {
        found = true;
        break;
      }
    };

    if (found === true) throw new Error("Previously dropped table found.");
    else
  }
  catch(e) {
    throw e;
  }
})

it('`tableDrop` should throw if no argument is given', async () => {
  try {
    result = await r.db(dbName).tableDrop().run();
  }
  catch(e) {
    if (e.message === '`tableDrop` takes 1 argument, 0 provided after:\nr.db("'+dbName+'")') {
      return;
    }
    else {
      throw e;
    }
  }
})


it('index operations', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.db(dbName).tableCreate(tableName).run();
    assert.equal(result.tables_created, 1);

    result = await r.db(dbName).table(tableName).indexCreate("newField").run();
    assert.deepEqual(result, {created: 1});

    result = await r.db(dbName).table(tableName).indexList().run();
    assert.deepEqual(result, ["newField"]);

    result = await r.db(dbName).table(tableName).indexWait().pluck('index', 'ready').run();
    assert.deepEqual(result, [ { index: 'newField', ready: true } ]);

    result = await r.db(dbName).table(tableName).indexStatus().pluck('index', 'ready').run();
    assert.deepEqual(result, [ { index: 'newField', ready: true } ]);

    result = await r.db(dbName).table(tableName).indexDrop("newField").run();
    assert.deepEqual(result, {dropped: 1});

    result = await r.db(dbName).table(tableName).indexCreate("field1", function(doc) { return doc("field1") }).run();
    assert.deepEqual(result, {created: 1});

    result = await r.db(dbName).table(tableName).indexWait('field1').pluck('index', 'ready').run();
    assert.deepEqual(result, [ { index: 'field1', ready: true } ]);

    result = await r.db(dbName).table(tableName).indexStatus('field1').pluck('index', 'ready').run();
    assert.deepEqual(result, [ { index: 'field1', ready: true } ]);

    result = await r.db(dbName).table(tableName).indexDrop("field1").run();
    assert.deepEqual(result, {dropped: 1});


  }
  catch(e) {
    throw e;
  }
})


it('`indexCreate` should work with options', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).indexCreate("foo", {multi: true}).run();
    assert.deepEqual(result, {created: 1});

    result = await r.db(dbName).table(tableName).indexCreate("foo1", row => row("foo"), {multi: true}).run();
    assert.deepEqual(result, {created: 1});

    result = await r.db(dbName).table(tableName).indexCreate("foo2", function(doc) { return doc("foo")}, {multi: true}).run();
    assert.deepEqual(result, {created: 1});

    await r.db(dbName).table(tableName).indexWait().run();

    result = await r.db(dbName).table(tableName).insert({foo: ["bar1", "bar2"], buzz: 1}).run()
    assert.equal(result.inserted, 1);

    result = await r.db(dbName).table(tableName).insert({foo: ["bar1", "bar3"], buzz: 2}).run()
    assert.equal(result.inserted, 1);

    result = await r.db(dbName).table(tableName).getAll("bar1", {index: "foo"}).count().run()
    assert.equal(result, 2)

    result = await r.db(dbName).table(tableName).getAll("bar1", {index: "foo1"}).count().run()
    assert.equal(result, 2)
    result = await r.db(dbName).table(tableName).getAll("bar1", {index: "foo2"}).count().run()
    assert.equal(result, 2)

    result = await r.db(dbName).table(tableName).getAll("bar2", {index: "foo"}).count().run()
    assert.equal(result, 1)
    result = await r.db(dbName).table(tableName).getAll("bar2", {index: "foo1"}).count().run()
    assert.equal(result, 1)
    result = await r.db(dbName).table(tableName).getAll("bar2", {index: "foo2"}).count().run()
    assert.equal(result, 1)

    result = await r.db(dbName).table(tableName).getAll("bar3", {index: "foo"}).count().run()
    assert.equal(result, 1)
    result = await r.db(dbName).table(tableName).getAll("bar3", {index: "foo1"}).count().run()
    assert.equal(result, 1)
    result = await r.db(dbName).table(tableName).getAll("bar3", {index: "foo2"}).count().run()
    assert.equal(result, 1)


    // Test when the function is wrapped in an array
    result = await r.db(dbName).table(tableName).indexCreate("buzz", [row => row("buzz")]).run();
    assert.deepEqual(result, {created: 1});

    await r.db(dbName).table(tableName).indexWait().run();

    result = await r.db(dbName).table(tableName).getAll([1], {index: "buzz"}).count().run()
    assert.equal(result, 1)

    return;

  }
  catch(e) {
    throw e;
  }

})

it('`indexCreate` should throw if no argument is passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).indexCreate().run();
  }
  catch(e) {
    if (e.message === '`indexCreate` takes at least 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`indexDrop` should throw if no argument is passed', async () => {
  try {
    let result: any = await r.db(dbName).table(tableName).indexDrop().run();
  }
  catch(e) {
    if (e.message === '`indexDrop` takes 1 argument, 0 provided after:\nr.db("'+dbName+'").table("'+tableName+'")') {

    }
    else {
      throw e;
    }
  }
})
it('`indexRename` should work', async () => {
  let toRename = uuid();
  let renamed = uuid();
  let existing = uuid();
  try {
    let result: any = await r.db(dbName).table(tableName).indexCreate(toRename).run();
    assert.deepEqual(result, {created: 1});

    let result: any = await r.db(dbName).table(tableName).indexRename(toRename, renamed).run();
    assert.deepEqual(result, {renamed: 1});

    let result: any = await r.db(dbName).table(tableName).indexCreate(existing).run();
    assert.deepEqual(result, {created: 1});

    let result: any = await r.db(dbName).table(tableName).indexRename(renamed, existing, {overwrite: true}).run();
    assert.deepEqual(result, {renamed: 1});


    return;

  }
  catch(e) {
    console.log(e);
    throw e;
  }

})
it('`indexRename` should not overwrite an index if not specified', async () => {
  try {
    let name = uuid();
    let otherName = uuid();

    let result: any = await r.db(dbName).table(tableName).indexCreate(name).run();
    assert.deepEqual(result, {created: 1});
    let result: any = await r.db(dbName).table(tableName).indexCreate(otherName).run();
    assert.deepEqual(result, {created: 1});

    let result: any = await r.db(dbName).table(tableName).indexRename(otherName, name).run();
  }
  catch(e) {
    if (e.message.match(/^Index `.*` already exists on table/)) {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`indexRename` should throw -- non valid args', async () => {
  try {
    tableName = uuid();

    result = await r.db(dbName).table(tableName).indexRename("foo", "bar", {nonValidArg: true}).run();
  }
  catch(e) {
    if (e.message.match(/^Unrecognized option `nonValidArg` in `indexRename`/)) {
      return;
    }
    else {
      throw e;
    }
  }
})

