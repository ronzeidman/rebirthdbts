// 7 passing (57ms)
// 7 failing
import assert from 'assert';
import { r } from '../src';
import config from './config';
import { uuid } from './util/common';

describe('manipulating databases', () => {
  before(async () => {
    await r.connectPool(config);
  });

  after(async () => {
    await r.getPoolMaster().drain();
  });

  it('`expr` should work', async () => {
    const result = await r.expr(1).run();
    assert(result, 1);
  });

  it('`dbList` should return a cursor', async () => {
    const result = await r.dbList().run();
    assert(Array.isArray(result));
  });

  it('`dbCreate` should create a database', async () => {
    const dbName = uuid(); // export to the global scope

    const result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);
  });

  it('`dbCreate` should throw if no argument is given', async () => {
    try {
      await r.dbCreate().run();
      assert.fail('should throw');
    } catch (e) {
      assert.equal(e.message, '`r.dbCreate` takes 1 argument, 0 provided.');
    }
  });

  it('`dbCreate` is not defined after a term', async () => {
    try {
      await r
        .expr(1)
        .dbCreate('foo')
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(e.message.endsWith('.dbCreate is not a function'));
    }
  });

  it('`dbCreate` is not defined after a term', async () => {
    try {
      await r
        .expr(1)
        .db('foo')
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(e.message.endsWith('.db is not a function'));
    }
  });

  it('`db` should throw is the name contains special char', async () => {
    try {
      await r.db('-_-').run();
      assert.fail('should throw');
    } catch (e) {
      assert(
        e.message.match(/Database name `-_-` invalid \(Use A-Za-z0-9_ only\)/)
      );
    }
  });

  it('`dbList` should show the database we created', async () => {
    const dbName = uuid(); // export to the global scope

    let result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.dbList().run();
    assert(Array.isArray(result));
    assert(result.find(name => name === dbName) !== undefined);
  });

  it('`dbDrop` should drop a table', async () => {
    const dbName = uuid(); // export to the global scope

    let result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.dbDrop(dbName).run();
    assert.deepEqual(result.dbs_dropped, 1);
  });

  it('`dbDrop` should throw if given too many arguments', async () => {
    try {
      await r.dbDrop('foo', 'bar', 'ette').run();
      assert.fail('should throw');
    } catch (e) {
      assert.equal(e.message, '`r.dbDrop` takes 1 argument, 3 provided.');
    }
  });

  it('`dbDrop` should throw if no argument is given', async () => {
    try {
      await r.dbDrop().run();
      assert.fail('should throw');
    } catch (e) {
      assert.equal(e.message, '`r.dbDrop` takes 1 argument, 0 provided.');
    }
  });

  it('`dbDrop` is not defined after a term', async () => {
    try {
      await r
        .expr(1)
        .dbDrop('foo')
        .run();
    } catch (e) {
      assert(e.message.endsWith('.dbDrop is not a function'));
    }
  });

  it('`dbList` is not defined after a term', async () => {
    try {
      await r
        .expr(1)
        .dbList('foo')
        .run();
      assert.fail('should throw');
    } catch (e) {
      assert(e.message.endsWith('.dbList is not a function'));
    }
  });

  it('`dbList` should contain dropped databases', async () => {
    const dbName = uuid(); // export to the global scope

    let result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r.dbDrop(dbName).run();
    assert.deepEqual(result.dbs_dropped, 1);

    result = await r.dbList().run();
    assert(Array.isArray(result));
    assert(result.find(name => name === dbName) === undefined);
  });
});
