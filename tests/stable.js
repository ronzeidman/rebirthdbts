import * as config from './config';
import { r } from '../src'; r.connect(config);
import assert from 'assert';

let connection; // global connection
let dbName, tableName, docs;


function s4() {
  return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
};

function uuid() {
  return s4()+s4()+s4()+s4()+s4()+s4()+s4()+s4();
}

// Tests for callbacks
it("Create db", function(done) {
  dbName = uuid();

  r.dbCreate(dbName).run().then(function(result) {
    assert.equal(result.dbs_created, 1);

  }).error(function(error) {
    throw error;
  })
})

it("Create table", function(done) {
  tableName = uuid();

  r.db(dbName).tableCreate(tableName).run().then(function(result) {
    assert.equal(result.tables_created, 1);

  }).error(function(error) {
    throw error;
  })
})

it("Insert", function(done) {
  r.db(dbName).table(tableName).insert([{name: "Michel", age: 27}, {name: "Sophie", age: 23}]).run().then(function(result) {
    assert.deepEqual(result.inserted, 2);

  }).error(function(error) {
    throw error;
  })
})


it("Table", function(done) {
  r.db(dbName).table(tableName).run().then(function(result) {
    assert(result.length, 2)
    docs = result;

  }).error(function(error) {
    throw error;
  })
})

it("get", function(done) {
  r.db(dbName).table(tableName).get(docs[0].id).run().then(function(result) {
    assert.deepEqual(result, docs[0])

  }).error(function(error) {
    throw error;
  })
})

it("datum", function(done) {
  r.expr({foo: "bar"}).run().then(function(result) {
    assert.deepEqual(result, {foo: "bar"})

  }).error(function(error) {
    throw error;
  })
})

it("date", function(done) {
  r.now().run().then(function(result) {
    assert(result instanceof Date)

  }).error(function(error) {
    throw error;
  })
})

