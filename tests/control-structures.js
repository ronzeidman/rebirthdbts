import * as config from './config';
import { r } from '../src';
r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';

let dbName, tableName, result;

it('`do` should work', async () => {
  try {
    let result: any = await r
      .expr({ a: 1 })
      .do(function(doc) {
        return doc('a');
      })
      .run();
    assert.equal(result, 1);
  } catch (e) {
    throw e;
  }
});
it('`r.do` should work', async () => {
  try {
    result = await r
      .do(1, 2, function(a, b) {
        return a;
      })
      .run();
    assert.equal(result, 1);

    result = await r
      .do(1, 2, function(a, b) {
        return b;
      })
      .run();
    assert.equal(result, 2);

    result = await r.do(3).run();
    assert.equal(result, 3);

    result = await r
      .expr(4)
      .do()
      .run();
    assert.equal(result, 4);

    result = await r.do(1, 2).run();
    assert.deepEqual(result, 2);

    result = await r.do(r.args([r.expr(3), r.expr(4)])).run();
    assert.deepEqual(result, 3);
  } catch (e) {
    console.log(e);
    throw e;
  }
});

it('`branch` should work', async () => {
  try {
    let result: any = await r.branch(true, 1, 2).run();
    assert.equal(result, 1);

    result = await r.branch(false, 1, 2).run();
    assert.equal(result, 2);

    result = await r
      .expr(false)
      .branch('foo', false, 'bar', 'lol')
      .run();
    assert.equal(result, 'lol');

    result = await r
      .expr(true)
      .branch('foo', false, 'bar', 'lol')
      .run();
    assert.equal(result, 'foo');

    result = await r
      .expr(false)
      .branch('foo', true, 'bar', 'lol')
      .run();
    assert.equal(result, 'bar');
  } catch (e) {
    throw e;
  }
});
it('`branch` should throw if no argument has been given', async () => {
  try {
    let result: any = await r.branch().run();
  } catch (e) {
    if (e.message.match(/^`r.branch` takes at least 3 arguments, 0 provided/)) {
      return;
    } else {
      throw e;
    }
  }
});
it('`branch` should throw if just one argument has been given', async () => {
  try {
    let result: any = await r.branch(true).run();
  } catch (e) {
    if (e.message.match(/^`r.branch` takes at least 3 arguments, 1 provided/)) {
      return;
    } else {
      throw e;
    }
  }
});
it('`branch` should throw if just two arguments have been given', async () => {
  try {
    let result: any = await r.branch(true, true).run();
  } catch (e) {
    if (e.message.match(/^`r.branch` takes at least 3 arguments, 2 provided/)) {
      return;
    } else {
      throw e;
    }
  }
});
it('`branch` is defined after a term', async () => {
  try {
    result = await r
      .expr(true)
      .branch(2, 3)
      .run();
    assert.equal(result, 2);
    result = await r
      .expr(false)
      .branch(2, 3)
      .run();
    assert.equal(result, 3);
  } catch (e) {
    throw e;
  }
});
it('`forEach` should work', async () => {
  try {
    let dbName = uuid();
    let tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);

    result = await r
      .expr([{ foo: 'bar' }, { foo: 'foo' }])
      .forEach(function(doc) {
        return r
          .db(dbName)
          .table(tableName)
          .insert(doc);
      })
      .run();
    assert.equal(result.inserted, 2);
  } catch (e) {
    throw e;
  }
});
it('`forEach` should throw if not given a function', async () => {
  try {
    result = await r
      .expr([{ foo: 'bar' }, { foo: 'foo' }])
      .forEach()
      .run();
  } catch (e) {
    if (e.message.match(/^`forEach` takes 1 argument, 0 provided after/)) {
    } else {
      throw e;
    }
  }
});

it('`r.range(x)` should work', async () => {
  try {
    let result: any = await r.range(10).run();
    assert.deepEqual(result, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
it('`r.range(x, y)` should work', async () => {
  try {
    let result: any = await r.range(3, 10).run();
    assert.deepEqual(result, [3, 4, 5, 6, 7, 8, 9]);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
it('`r.range(1,2,3)` should throw - arity', async () => {
  try {
    let result: any = await r.range(1, 2, 3).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.range` takes at most 2 arguments, 3 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`r.range()` should throw - arity', async () => {
  try {
    let result: any = await r.range().run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.range` takes at least 1 argument, 0 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});

it('`default` should work', async () => {
  try {
    let result: any = await r
      .expr({ a: 1 })('b')
      .default('Hello')
      .run();
    assert.equal(result, 'Hello');
  } catch (e) {
    throw e;
  }
});
it('`default` should throw if no argument has been given', async () => {
  try {
    let result: any = await r
      .expr({})('')
      .default()
      .run();
  } catch (e) {
    if (e.message.match(/^`default` takes 1 argument, 0 provided after/)) {
      return;
    } else {
      throw e;
    }
  }
});

it('`r.js` should work', async () => {
  try {
    let result: any = await r.js('1').run();
    assert.equal(result, 1);
  } catch (e) {
    throw e;
  }
});
it('`js` is not defined after a term', async () => {
  try {
    result = await r
      .expr(1)
      .js('foo')
      .run();
  } catch (e) {
    if (e.message === '`js` is not defined after:\nr.expr(1)') {
      return;
    } else {
      throw e;
    }
  }
});
it('`js` should throw if no argument has been given', async () => {
  try {
    let result: any = await r.js().run();
  } catch (e) {
    if (e.message.match(/^`r.js` takes at least 1 argument, 0 provided/)) {
      return;
    } else {
      throw e;
    }
  }
});

it('`coerceTo` should work', async () => {
  try {
    let result: any = await r
      .expr(1)
      .coerceTo('STRING')
      .run();
    assert.equal(result, '1');
  } catch (e) {
    throw e;
  }
});
it('`coerceTo` should throw if no argument has been given', async () => {
  try {
    let result: any = await r
      .expr(1)
      .coerceTo()
      .run();
  } catch (e) {
    if (e.message.match(/^`coerceTo` takes 1 argument, 0 provided/)) {
      return;
    } else {
      throw e;
    }
  }
});

it('`typeOf` should work', async () => {
  try {
    let result: any = await r
      .expr(1)
      .typeOf()
      .run();
    assert.equal(result, 'NUMBER');
  } catch (e) {
    throw e;
  }
});
it('`r.typeOf` should work', async () => {
  try {
    let result: any = await r.typeOf(1).run();
    assert.equal(result, 'NUMBER');
  } catch (e) {
    throw e;
  }
});

it('`json` should work', async () => {
  try {
    let result: any = await r.json(JSON.stringify({ a: 1 })).run();
    assert.deepEqual(result, { a: 1 });

    result = await r.json('{}').run();
    assert.deepEqual(result, {});
  } catch (e) {
    throw e;
  }
});
it('`json` should throw if no argument has been given', async () => {
  try {
    let result: any = await r.json().run();
  } catch (e) {
    if (e.message === '`r.json` takes 1 argument, 0 provided.') {
      return;
    } else {
      throw e;
    }
  }
});
it('`json` is not defined after a term', async () => {
  try {
    result = await r
      .expr(1)
      .json('1')
      .run();
  } catch (e) {
    if (e.message.match(/^`json` is not defined after/)) {
      return;
    } else {
      throw e;
    }
  }
});
it('`toJSON` and `toJsonString` should work', async () => {
  try {
    let result: any = await r
      .expr({ a: 1 })
      .toJSON()
      .run();
    assert.equal(result, '{"a":1}');

    let result: any = await r
      .expr({ a: 1 })
      .toJsonString()
      .run();
    assert.equal(result, '{"a":1}');
  } catch (e) {
    throw e;
  }
});
it('`toJSON` should throw if an argument is provided', async () => {
  try {
    let result: any = await r
      .expr({ a: 1 })
      .toJSON('foo')
      .run();
    throw new Error('Expecting error...');
  } catch (e) {
    if (e.message.match(/^`toJSON` takes 0 arguments, 1 provided/) !== null) {
      return;
    } else {
      throw e;
    }
  }
});

it('`args` should work', async () => {
  try {
    let result: any = await r.args([10, 20, 30]).run();
    assert.deepEqual(result, [10, 20, 30]);

    result = await r
      .expr({ foo: 1, bar: 2, buzz: 3 })
      .pluck(r.args(['foo', 'buzz']))
      .run();
    assert.deepEqual(result, { foo: 1, buzz: 3 });
  } catch (e) {
    console.log(e);
    throw e;
  }
});
it('`args` should throw if an implicit let is passed inside', async () => {
  try {
    let cursor = await r
      .table('foo')
      .eqJoin(r.args([row => row, r.table('bar')]))
      .run();
  } catch (e) {
    if (
      e.message ===
      'Implicit variable `row => row` cannot be used inside `r.args`.'
    ) {
    } else {
      throw e;
    }
  }
});
it('`http` should work', async () => {
  try {
    let result: any = await r.http('http://google.com').run();
    assert.equal(typeof result, 'string');
  } catch (e) {
    throw e;
  }
});
it('`http` should work with options', async () => {
  try {
    let result: any = await r.http('http://google.com', { timeout: 60 }).run();
    assert.equal(typeof result, 'string');
  } catch (e) {
    throw e;
  }
});
it('`http` should throw with an unrecognized option', async () => {
  try {
    let result: any = await r.http('http://google.com', { foo: 60 }).run();
    throw new Error('Expecting error...');
  } catch (e) {
    if (
      e.message ===
      'Unrecognized option `foo` in `http`. Available options are attempts <number>, redirects <number>, verify <boolean>, resultFormat: <string>, method: <string>, auth: <object>, params: <object>, header: <string>, data: <string>, page: <string/function>, pageLimit: <number>.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});
it('`r.uuid` should work', async () => {
  try {
    let result: any = await r.uuid().run();
    assert.equal(typeof result, 'string');
  } catch (e) {
    throw e;
  }
});

it('`r.uuid("foo")` should work', async () => {
  try {
    let result: any = await r.uuid('rethinkdbdash').run();
    assert.equal(result, '291a8039-bc4b-5472-9b2a-f133254e3283');
  } catch (e) {
    throw e;
  }
});
