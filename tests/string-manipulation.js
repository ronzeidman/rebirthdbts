import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;


it('`match` should work', async () => {
  try {
    result = await r.expr("hello").match("hello").run()
    assert.deepEqual(result, {"end":5,"groups":[],"start":0,"str":"hello"});

  }
  catch(e) {
    throw e;
  }
})
it('`match` should throw if no arguement has been passed', async () => {
  try {
    result = await r.expr("foo").match().run();
  }
  catch(e) {
    if (e.message === "`match` takes 1 argument, 0 provided after:\nr.expr(\"foo\")") {

    }
    else {
      throw e;
    }
  }
})
it('`upcase` should work', async () => {
  try {
    result = await r.expr("helLo").upcase().run();
    assert.equal(result, "HELLO");

  }
  catch(e) {
    throw e;
  }
})
it('`downcase` should work', async () => {
  try {
    result = await r.expr("HElLo").downcase().run();
    assert.equal(result, "hello");

  }
  catch(e) {
    throw e;
  }
})
it('`split` should work', async () => {
  try {
    result = await r.expr("foo  bar bax").split().run();
    assert.deepEqual(result, ["foo",  "bar", "bax"]);

  }
  catch(e) {
    throw e;
  }
})
it('`split(separator)` should work', async () => {
   try {
    result = await r.expr("12,37,,22,").split(",").run();
    assert.deepEqual(result, ["12", "37", "", "22", ""]);

  }
  catch(e) {
    throw e;
  }
})
it('`split(separtor, max)` should work', async () => {
  try {
    result = await r.expr("foo  bar bax").split(null, 1).run();
    assert.deepEqual(result, ["foo", "bar bax"]);

  }
  catch(e) {
    throw e;
  }
})

