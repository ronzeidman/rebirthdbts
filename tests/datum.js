import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;


it("All raws datum shoul be defined", async () => {
  try {
    let result: any = await r.expr(1).run();
    assert.equal(result, 1);

    result = await r.expr(null).run();
    assert.equal(result, null);

    result = await r.expr(false).run();
    assert.equal(result, false);

    result = await r.expr(true).run();
    assert.equal(result, true);

    result = await r.expr("Hello").run();
    assert.equal(result, "Hello");

    result = await r.expr([0, 1, 2]).run();
    assert.deepEqual(result, [0, 1, 2]);


    result = await r.expr({a: 0, b: 1}).run();
    assert.deepEqual(result, {a: 0, b: 1});


  }
  catch(e) {
    throw e;
  }
})
it("`expr` is not defined after a term", async () => {
  try {
    result = await r.expr(1).expr("foo").run();
  }
  catch(e) {
    if (e.message === "`expr` is not defined after:\nr.expr(1)") {
      return;
    }
    else {
      throw e;
    }
  }
})
it("`r.expr` should take a nestingLevel value and throw if the nesting level is reached", async () => {
  try {
    r.expr({a :{b: {c: {d: 1}}}}, 2)
  }
  catch(e) {
    if (e.message === "Nesting depth limit exceeded.\nYou probably have a circular reference somewhere.") {
      return;
    }
    else {
      throw e;
    }
  }
})
it("`r.expr` should throw when setNestingLevel is too small", async () => {
  try {
    r.setNestingLevel(2);
    let result: any = await r.expr({a :{b: {c: {d: 1}}}}).run();
  }
  catch(e) {
    if (e.message === "Nesting depth limit exceeded.\nYou probably have a circular reference somewhere.") {
      return;
    }
    else {
      throw e;
    }
  }
})

it("`r.expr` should work when setNestingLevel set back the value to 100", async () => {
  try {
    r.setNestingLevel(100);
    let result: any = await r.expr({a :{b: {c: {d: 1}}}}).run();
    assert.deepEqual(result, {a :{b: {c: {d: 1}}}})

  }
  catch(e) {
    throw e;
  }
})

it("`r.expr` should throw when ArrayLimit is too small", async () => {
  try {
    let result: any = await r.expr([0,1,2,3,4,5,6,8,9]).run({arrayLimit: 2});
    throw new Error("Was expecting an error");
  }
  catch(e) {
    if (e.message.match(/^Array over size limit `2` in/)) {
      return;
    }
    else {
      throw e;
    }
  }
})
it("`r.expr` should throw when ArrayLimit is too small - options in run take precedence", async () => {
  try {
    r.setArrayLimit(100);
    let result: any = await r.expr([0,1,2,3,4,5,6,8,9]).run({arrayLimit: 2});
    throw new Error("Was expecting an error");
  }
  catch(e) {
    if (e.message.match(/^Array over size limit `2` in/)) {
      return;
    }
    else {
      throw e;
    }
  }
})

it("`r.expr` should throw when setArrayLimit is too small", async () => {
  try {
    r.setArrayLimit(2);
    let result: any = await r.expr([0,1,2,3,4,5,6,8,9]).run();
    throw new Error("Was expecting an error");
  }
  catch(e) {
    if (e.message.match(/^Array over size limit `2` in/)) {
      return;
    }
    else {
      throw e;
    }
  }
})

it("`r.expr` should work when setArrayLimit set back the value to 100000", async () => {
  try {
    r.setArrayLimit(100000);
    let result: any = await r.expr([0,1,2,3,4,5,6,8,9]).run();
    assert.deepEqual(result, [0,1,2,3,4,5,6,8,9])

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})

it("`r.expr` should fail with NaN", async () => {
  try {
    let result: any = await r.expr(NaN).run();
    throw new Error("NaN should throw an error");
  }
  catch(e) {
    if (e.message.match(/^Cannot convert `NaN` to JSON/)) {

    }
    else {
      console.log(e.message);
      throw e;
    }
  }
})
it("`r.expr` should not NaN if not run", async () => {
  try {
    r.expr(NaN);

  }
  catch(e) {
    throw e;
  }
})

it("`r.expr` should fail with Infinity", async () => {
  try {
    let result: any = await r.expr(Infinity).run();
    throw new Error("Infinity should throw an error");
  }
  catch(e) {
    if (e.message.match(/^Cannot convert `Infinity` to JSON/)) {

    }
    else {
      console.log(e.message);
      throw e;
    }
  }
})
it("`r.expr` should not Infinity if not run", async () => {
  try {
    r.expr(Infinity);

  }
  catch(e) {
    throw e;
  }
})
it("`r.expr` should work with high unicode char", async () => {
  try {
    let result: any = await r.expr('“').run();
    assert.equal(result, '“')

  }
  catch(e) {
    throw e;
  }
})
it("`r.binary` should work - with a buffer", async () => {
  try {
    let result: any = await r.binary(new Buffer([1,2,3,4,5,6])).run();
    assert(result instanceof Buffer);
    assert.deepEqual(result.toJSON().data, [1,2,3,4,5,6]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})
it("`r.binary` should work - with a ReQL term", async () => {
  try {
    let result: any = await r.binary(r.expr("foo")).run();
    assert(result instanceof Buffer);
    result = await r.expr(result).coerceTo("STRING").run();
    assert.equal(result, "foo");

  }
  catch(e) {
    throw e;
  }
})

it("`r.expr` should work with binaries", async () => {
  try {
    let result: any = await r.expr(new Buffer([1,2,3,4,5,6])).run();
    assert(result instanceof Buffer);
    assert.deepEqual(result.toJSON().data, [1,2,3,4,5,6]);

  }
  catch(e) {
    console.log(e);
    throw e;
  }
})

