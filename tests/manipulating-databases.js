import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;


it('Init for `manipulating-databases.js`', async () => {
  try {
    result = await r.expr(1).run();
    assert(result, 1);

  }
  catch(e) {
    throw e;
  }
})

it('`dbList` should return a cursor', async () => {
  try {
    result = await r.dbList().run();
    assert(Array.isArray(result));

  }
  catch(e) {
    throw e;
  }
})

it('`dbCreate` should create a database', async () => {
  try {
    dbName = uuid(); // export to the global scope

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`dbCreate` should throw if no argument is given', async () => {
  try {
    result = await r.dbCreate().run();
  }
  catch(e) {
    if (e.message === "`dbCreate` takes 1 argument, 0 provided.") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`dbCreate` is not defined after a term', async () => {
  try {
    result = await r.expr(1).dbCreate("foo").run();
  }
  catch(e) {
    if (e.message === "`dbCreate` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`dbCreate` is not defined after a term', async () => {
  try {
    result = await r.expr(1).db("foo").run();
  }
  catch(e) {
    if (e.message === "`db` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`db` should throw is the name contains special char', async () => {
  try {
    result = await r.db("-_-").run();
  }
  catch(e) {
    if (e.message.match(/Database name `-_-` invalid \(Use A-Za-z0-9_ only\)/)) {  }
    else { throw e; }
  }
})
it('`dbList` should show the database we created', async () => {
  try {
    result = await r.dbList().run();
    assert(Array.isArray(result));

    let found = false;
    for(let i=0; i<result.length; i++) {
      if (result[i] === dbName) {
        found = true;
        break;
      }
    };

    if (found === false) throw new Error("Previously created database not found.");

  }
  catch(e) {
    throw e;
  }
})
it('`dbDrop` should drop a table', async () => {
  try {
    result = await r.dbDrop(dbName).run();
    assert.deepEqual(result.dbs_dropped, 1);


  }
  catch(e) {
    console.log(e);
    throw e;
  }
})
it('`dbDrop` should throw if no argument is given', async () => {
  try {
    result = await r.dbDrop("foo", "bar", "ette").run();
  }
  catch(e) {
    if (e.message === "`dbDrop` takes 1 argument, 3 provided.") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`dbDrop` should throw if no argument is given', async () => {
  try {
    result = await r.dbDrop().run();
  }
  catch(e) {
    if (e.message === "`dbDrop` takes 1 argument, 0 provided.") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`dbDrop` is not defined after a term', async () => {
  try {
    result = await r.expr(1).dbDrop("foo").run();
  }
  catch(e) {
    if (e.message === "`dbDrop` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it('`dbList` is not defined after a term', async () => {
  try {
    result = await r.expr(1).dbList("foo").run();
  }
  catch(e) {
    if (e.message === "`dbList` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})


it('`dbList` should not show the database we dropped', async () => {
  try {
    result = await r.dbList().run();
    assert(Array.isArray(result));

    let found = false;
    for(let i=0; i<result.length; i++) {
      if (result[i] === dbName) {
        found = true;
        break;
      }
    };

    if (found === true) throw new Error("Previously dropped database found.");

  }
  catch(e) {
    throw e;
  }
})
