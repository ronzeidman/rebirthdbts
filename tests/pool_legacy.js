import * as config from './config';
let r = require(__dirname + '/../lib')({ pool: false, silent: true });
import { uuid } from './util/common';
import assert from 'assert';

let dbName, tableName, result, pks;

let options = {
  max: 10,
  buffer: 2,
  host: config.host,
  port: config.port,
  authKey: config.authKey,
  discovery: false,
  silent: true
};

it('`createPool` should create a PoolMaster and `getPoolMaster` should return it', async () => {
  try {
    r = r.createPools(options);
    assert(r.getPoolMaster(config));
    assert.equal(r.getPoolMaster().getPools().length, 1);
  } catch (e) {
    throw e;
  }
});

//TODO try to make this tests a little more deterministic
it('`run` should work without a connection if a pool exists', async () => {
  try {
    result = await r.expr(1).run();
    assert.equal(result, 1);
    return;
  } catch (e) {
    throw e;
  }
});
it('The pool should keep a buffer', async () => {
  try {
    result = await [
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run()
    ];
    assert.deepEqual(result, [1, 1, 1, 1, 1]);
    assert(r.getPool(0).getLength() >= options.buffer + result.length);

    setTimeout(function() {
      assert(r.getPool(0).getAvailableLength() >= result.length); // The connections created for the buffer may not be available yet
      assert.equal(r.getPool(0).getLength(), r.getPool(0).getLength());
    }, 500);
  } catch (e) {
    throw e;
  }
});
it('A noreply query should release the connection', async () => {
  try {
    let numConnections = r.getPool(0).getLength();
    await r.expr(1).run({ noreply: true });
    assert.equal(r.getPool(0).getLength(), numConnections);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
it('The pool should not have more than `options.max` connections', async () => {
  try {
    result = await [
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run()
    ];
    assert.deepEqual(result, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    assert.equal(r.getPool(0).getLength(), options.max);

    setTimeout(function() {
      assert.equal(r.getPool(0).getAvailableLength(), options.max);
      assert.equal(r.getPool(0).getAvailableLength(), r.getPool(0).getLength());
      return;
    }, 500);
  } catch (e) {
    throw e;
  }
});

it('Init for `pool.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);

    result = await r
      .db(dbName)
      .table(tableName)
      .insert(eval('[' + new Array(10000).join('{}, ') + '{}]'))
      .run();
    assert.equal(result.inserted, 10000);
    pks = result.generated_keys;
  } catch (e) {
    throw e;
  }
});
it('Updating data to make it heavier', async () => {
  try {
    //Making bigger documents to retrieve multiple batches
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .update({
        foo: uuid(),
        fooo: uuid(),
        foooo: uuid(),
        fooooo: uuid(),
        foooooo: uuid(),
        fooooooo: uuid(),
        foooooooo: uuid(),
        fooooooooo: uuid(),
        foooooooooo: uuid(),
        date: r.now()
      })
      .run();
  } catch (e) {
    throw e;
  }
});

it('The pool should release a connection only when the cursor has fetch everything or get closed', async () => {
  try {
    result = await [
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true }),
      r
        .db(dbName)
        .table(tableName)
        .run({ cursor: true })
    ];
    assert.equal(result.length, 10);
    assert.equal(r.getPool(0).getAvailableLength(), 0);
    await result[0].toArray();
    assert.equal(r.getPool(0).getAvailableLength(), 1);
    await result[1].toArray();
    assert.equal(r.getPool(0).getAvailableLength(), 2);
    await result[2].close();
    assert.equal(r.getPool(0).getAvailableLength(), 3);
    await [
      result[3].close(),
      result[4].close(),
      result[5].close(),
      result[6].close(),
      result[7].close(),
      result[8].close(),
      result[9].close()
    ];
  } catch (e) {
    throw e;
  }
});

it('The pool should shrink if a connection is not used for some time', async () => {
  try {
    r.getPool(0).setOptions({ timeoutGb: 100 });

    result = await [
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run(),
      r.expr(1).run()
    ];

    assert.deepEqual(result, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    setTimeout(function() {
      assert.equal(r.getPool(0).getAvailableLength(), options.buffer);
      assert.equal(r.getPool(0).getLength(), options.buffer);
      return;
    }, 400);
  } catch (e) {
    throw e;
  }
});

it('`poolMaster.drain` should eventually remove all the connections', async () => {
  try {
    await r.getPoolMaster().drain();

    assert.equal(r.getPool(0).getAvailableLength(), 0);
    assert.equal(r.getPool(0).getLength(), 0);

    return;
  } catch (e) {
    throw e;
  }
});
it('If the pool cannot create a connection, it should reject queries', async () => {
  try {
    let r = require(__dirname + '/../lib')({
      host: 'notarealhost',
      buffer: 1,
      max: 2,
      silent: true
    });
    await r.expr(1).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message ===
      'None of the pools have an opened connection and failed to open a new one.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});
it('If the pool cannot create a connection, it should reject queries - timeout', async () => {
  try {
    let r = require(__dirname + '/../lib')({
      host: 'notarealhost',
      buffer: 1,
      max: 2,
      silent: true
    });
    await new Promise(function(resolve, reject) {
      setTimeout(resolve, 1000);
    });
    await r.expr(1).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message ===
      'None of the pools have an opened connection and failed to open a new one.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('If the pool is drained, it should reject queries - 1', async () => {
  try {
    let r = require(__dirname + '/../lib')({ buffer: 1, max: 2, silent: true });

    r.getPoolMaster().drain();
    let result: any = await r.expr(1).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message ===
      'None of the pools have an opened connection and failed to open a new one.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('If the pool is drained, it should reject queries - 2', async () => {
  try {
    let r = require(__dirname + '/../lib')({ buffer: 1, max: 2, silent: true });

    await r.getPoolMaster().drain();
    let result: any = await r.expr(1).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message ===
      'None of the pools have an opened connection and failed to open a new one.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('`drain` should work in case of failures', async () => {
  try {
    r = r.createPools({
      port: 80, // non valid port
      silent: true,
      timeoutError: 100
    });
    let pool = r.getPool(0);
    // Sleep 1 sec
    await new Promise(function(resolve, reject) {
      setTimeout(resolve, 150);
    });
    pool.drain();

    // timeoutReconnect should have been canceled
    assert.equal(pool.timeoutReconnect, null);
    pool.options.silent = false;
    await new Promise(function(resolve, reject) {
      setTimeout(resolve, 1000);
    });
  } catch (e) {
    throw e;
  }
});

/*
// This doesn't work anymore because since the JSON protocol was introduced.
it('The pool should remove a connection if it errored', async () => {
  try{
    r.getPool(0).setOptions({timeoutGb: 60*60*1000});

    result = await [r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run(), r.expr(1).run()]

    assert.deepEqual(result, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])

    // This query will make the error return an error -1
    result = await r.expr(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1).add(1)
      .run()


  }
  catch(e) {
    if ((true) || (e.message === "Client is buggy (failed to deserialize protobuf)")) {
      // We expect the connection that errored to get closed in the next second
      setTimeout(function() {
        assert.equal(r.getPool().getAvailableLength(), options.max-1)
        assert.equal(r.getPool().getLength(), options.max-1)
        return;
      }, 1000)
    }
    else {
      throw e;
    }

  }
});
*/
