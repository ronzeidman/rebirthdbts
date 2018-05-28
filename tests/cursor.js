let config = require('./config.js');
let r = require('../lib')(config);
import { uuid } from './util/common';
import assert from 'assert';


let it = util.it

let dbName, tableName, tableName2, cursor, result, pks, feed;

let numDocs = 100; // Number of documents in the "big table" used to test the SUCCESS_PARTIAL
let smallNumDocs = 5; // Number of documents in the "small table"

it('Init for `cursor.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid(); // Big table to test partial sequence
    tableName2 = uuid(); // small table to test success sequence

    result = await r.dbCreate(dbName).run()
    assert.equal(result.dbs_created, 1);
    result = await [r.db(dbName).tableCreate(tableName)('tables_created').run(), r.db(dbName).tableCreate(tableName2)('tables_created').run()]
    assert.deepEqual(result, [1, 1]);

  }
  catch(e) {
    throw e;
  }
})
it('Inserting batch - table 1', async () => {
  try {
    result = await r.db(dbName).table(tableName).insert(eval('['+new Array(numDocs).join('{}, ')+'{}]')).run();
    assert.equal(result.inserted, numDocs);

  }
  catch(e) {
    throw e;
  }
})
it('Inserting batch - table 2', async () => {
  try {
    result = await r.db(dbName).table(tableName2).insert(eval('['+new Array(smallNumDocs).join('{}, ')+'{}]')).run();
    assert.equal(result.inserted, smallNumDocs);

  }
  catch(e) {
    throw e;
  }
})
it('Updating batch', async () => {
  try {
    // Add a date
    result = await r.db(dbName).table(tableName).update({
      date: r.now().sub(r.random().mul(1000000)),
      value: r.random()
    }, {nonAtomic: true}).run();

  }
  catch(e) {
    throw e;
  }
})
it('`table` should return a cursor', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    assert.equal(cursor.toString(), '[object Cursor]');


  }
  catch(e) {
    throw e;
  }
})

it('`next` should return a document', async () => {
  try {
    result = await cursor.next();
    assert(result);
    assert(result.id);


  }
  catch(e) {
    throw e;
  }
})
it('`each` should work', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    let count = 0;
    cursor.each(function(err, result) {
      count++;
      if (count === numDocs) {

      }
    })
  }
  catch(e) {
    throw e;
  }
})
it('`eachAsync` should work', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    let history = [];
    let count = 0;
    let promisesWait = 0;
    cursor.eachAsync(function(result) {
      history.push(count);
      count++;
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          history.push(promisesWait);
          promisesWait--;

          if (count === numDocs) {
            let expected = [];
            for(let i=0; i<numDocs; i++) {
              expected.push(i);
              expected.push(-1*i);
            }
            assert.deepEqual(history, expected)
          }
          resolve();
        }, 1);
      });
    }).then(done);
  }
  catch(e) {
    throw e;
  }
})

it('`eachAsync` should work - callback style', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    let count = 0;
    let now = Date.now();
    let timeout = 10;
    cursor.eachAsync(function(result, onRowFinished) {
      count++;
      setTimeout(function() {
        onRowFinished();
      }, timeout)
    }).then(function() {
      let elapsed = Date.now()-now;
      assert(elapsed >= timeout*count);

    });
  }
  catch(e) {
    throw e;
  }
})

it('`each` should work - onFinish - reach end', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    let count = 0;
    cursor.each(function(err, result) {
    }, done)
  }
  catch(e) {
    throw e;
  }
})
it('`each` should work - onFinish - return false', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    assert(cursor);
    let count = 0;
    cursor.each(function(err, result) {
      count++
      return false
    }, function() {
      assert.equal(count, 1);

    })
  }
  catch(e) {
    throw e;
  }
})


it('`toArray` should work', async () => {
  try {
    cursor = await r.db(dbName).table(tableName).run({cursor: true});
    result = await cursor.toArray();
    assert.equal(result.length, numDocs);


  }
  catch(e) {
    throw e;
  }
})
it('`toArray` should work -- with a profile', async () => {
  try {
    result = await r.db(dbName).table(tableName).run({cursor: true, profile: true});
    result = await result.result.toArray();
    assert.equal(result.length, numDocs);


  }
  catch(e) {
    throw e;
  }
})
it('`toArray` should work with a datum', async () => {
  try {
    cursor = await r.expr([1,2,3]).run({cursor: true});
    result = await cursor.toArray();
    assert.deepEqual(result, [1,2,3]);


  }
  catch(e) {
    throw e;
  }
})

it('`table` should return a cursor - 2', async () => {
  try {
    cursor = await r.db(dbName).table(tableName2).run({cursor: true});
    assert(cursor);


  }
  catch(e) {
    throw e;
  }
})

it('`next` should return a document - 2', async () => {
  try {
    result = await cursor.next();
    assert(result);
    assert(result.id);


  }
  catch(e) {
    throw e;
  }
})
it('`next` should work -- testing common pattern', async () => {
  try {
    cursor = await r.db(dbName).table(tableName2).run({cursor: true});
    assert(cursor);
    let i=0;
    while(true) {
      try{
        result = await cursor.next();
        assert(result);
        i++;
      }
      catch(e) {
        if (e.message === "No more rows in the cursor.") {
          assert.equal(smallNumDocs, i);

          break;
        }
        else {
          throw e;
          break;
        }
      }
    }
  }
  catch(e) {
    throw e;
  }
})
it('`toArray` should work - 2', async () => {
  try {
    let cursor = await r.db(dbName).table(tableName2).run({cursor: true});
    result = await cursor.toArray();
    assert.equal(result.length, smallNumDocs);


  }
  catch(e) {
    throw e;
  }
})

it('`cursor.close` should return a promise', async () => {
  try {
    let cursor = await r.db(dbName).table(tableName2).run({cursor: true});
    await cursor.close();

  }
  catch(e) {
    throw e;
  }
})
it('`cursor.close` should still return a promise if the cursor was closed', async () => {
  try {
    let cursor = await r.db(dbName).table(tableName2).changes().run();
    await cursor.close();
    await cursor.close();

  }
  catch(e) {
    throw e;
  }
})

it('cursor shouldn\'t throw if the user try to serialize it in JSON', async () => {
  try {
    let cursor = await r.db(dbName).table(tableName).run({cursor: true});
    cursor.toJSON()
    throw new Error('Was expecting an error');
  }
  catch(e) {
    assert.equal(e.message, "You cannot serialize a Cursor to JSON. Retrieve data from the cursor with `toArray` or `next`.");

  }
})

// This test is not working for now -- need more data? Server bug?
it('Remove the field `val` in some docs', async () => {
  let i=0;
  try {
    result = await r.db(dbName).table(tableName).update({val: 1}).run();
    //assert.equal(result.replaced, numDocs);

    result = await r.db(dbName).table(tableName)
      .orderBy({index: r.desc("id")}).limit(5).replace(row => row.without("val"))
      //.sample(1).replace(row => row.without("val"))
      .run({cursor: true});
    assert.equal(result.replaced, 5);

  }
  catch(e) {
    throw e;
  }
})
it('`toArray` with multiple batches - testing empty SUCCESS_COMPLETE', async () => {
  let i=0;
  try {
    let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
    assert(connection);

    cursor = await r.db(dbName).table(tableName).run(connection, {cursor: true, maxBatchRows: 1});

    assert(cursor);
    result = await cursor.toArray();

  }
  catch(e) {
    throw e;
  }
})
it('Automatic coercion from cursor to table with multiple batches', async () => {
  let i=0;
  try {
    let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
    assert(connection);

    result = await r.db(dbName).table(tableName).run(connection, {maxBatchRows: 1});
    assert(result.length > 0);

  }
  catch(e) {
    throw e;
  }
})
it('`next` with multiple batches', async () => {
  let i=0;
  try {
    let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
    assert(connection);

    cursor = await r.db(dbName).table(tableName).run(connection, {cursor: true, maxBatchRows: 1});

    assert(cursor);
    while(true) {
      try {
        result = await cursor.next();
        i++;
      }
      catch(e) {
        if ((i > 0) && (e.message === "No more rows in the cursor.")) {
          connection.close();
          return;
        }
        else {
          throw e;
        }
        break;
      }
    }
  }
  catch(e) {
    throw e;
  }
})
it('`next` should error when hitting an error -- not on the first batch', async () => {
  let i=0;
  try {
    let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
    assert(connection);

    let cursor = await r.db(dbName).table(tableName)
      .orderBy({index: "id"})
      .map(row => row("val").add(1))
      .run(connection, {cursor: true, maxBatchRows: 10});

    assert(cursor);
    while(true) {
      try {
        result = await cursor.next();
        i++;
      }
      catch(e) {
        if ((i > 0) && (e.message.match(/^No attribute `val` in object/))) {
          connection.close();
          return;
        }
        else {
          throw e;
        }
        break;
      }
    }
  }
  catch(e) {
    throw e;
  }
})

it('`changes` should return a feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName).changes().run();
    assert(feed);
    assert.equal(feed.toString(), '[object Feed]');
    await feed.close();

  }
  catch(e) {
    throw e;
  }
})
it('`changes` should work with squash: true', async () => {
  try {
    feed = await r.db(dbName).table(tableName).changes({squash: true}).run();
    assert(feed);
    assert.equal(feed.toString(), '[object Feed]');
    await feed.close();

  }
  catch(e) {
    throw e;
  }
})

it('`get.changes` should return a feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName).get(1).changes().run();
    assert(feed);
    assert.equal(feed.toString(), '[object AtomFeed]');
    await feed.close();

  }
  catch(e) {
    throw e;
  }
})
it('`orderBy.limit.changes` should return a feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName).orderBy({index: 'id'}).limit(2).changes().run();
    assert(feed);
    assert.equal(feed.toString(), '[object OrderByLimitFeed]');
    await feed.close();

  }
  catch(e) {
    throw e;
  }
})

it('`changes` with `includeOffsets` should work', async () => {
  try {
    feed = await r.db(dbName).table(tableName).orderBy({index: 'id'}).limit(2).changes({
      includeOffsets: true,
      includeInitial: true
    }).run();

    let counter = 0;
    feed.each(function(error, change) {
      assert(typeof change.new_offset === 'number');
      if (counter >= 2) {
        assert(typeof change.old_offset === 'number');
        feed.close().then(function() {

        }).error(done);
      }
      counter++;
    });

    await r.db(dbName).table(tableName).insert({id: 0});

    //
  }
  catch(e) {
    throw e;
  }
})

it('`changes` with `includeTypes` should work', async () => {
  try {
    feed = await r.db(dbName).table(tableName).orderBy({index: 'id'}).limit(2).changes({
      includeTypes: true,
      includeInitial: true
    }).run();

    let counter = 0;
    feed.each(function(error, change) {
      assert(typeof change.type === 'string');
      if (counter > 0) {
        feed.close().then(function() {

        }).error(done);
      }
      counter++;
    });

    await r.db(dbName).table(tableName).insert({id: 0});

    //
  }
  catch(e) {
    throw e;
  }
})


it('`next` should work on a feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).update({foo: r.now()}).run();
    }, 100)
    assert(feed);
    let i=0;
    while(true) {
      result = await feed.next();
      assert(result);
      i++;
      if (i === smallNumDocs) {
        await feed.close();

        break;
      }
    }
  }
  catch(e) {
    throw e;
  }
})
it('`next` should work on an atom feed', async () => {
  try {
    let idValue = uuid();
    feed = await r.db(dbName).table(tableName2).get(idValue).changes({includeInitial: true}).run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).insert({id: idValue}).run();
    }, 100)
    assert(feed);
    let i=0;
    let change = await feed.next();
    assert.deepEqual(change, {new_val: null});
    change = await feed.next();
    assert.deepEqual(change, {new_val: {id: idValue}, old_val: null});
    await feed.close();


  }
  catch(e) {
    throw e;
  }
})

it('`close` should work on feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      feed.close().then(function() {

      });
    }, 1000)
    assert(feed);
  }
  catch(e) {
    throw e;
  }
})

it('`close` should work on feed with events', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      feed.close();
    }, 1000)
    assert(feed);
    feed.on('error', function() {
      // Ignore the error
    });
    feed.on('end', function() {

    });
  }
  catch(e) {
    throw e;
  }
})
it('`on` should work on feed', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).update({foo: r.now()}).run();
    }, 100)
    let i=0;
    feed.on('data', function() {
      i++;
      if (i === smallNumDocs) {
        feed.close().then(function() {

        }).error(function(error) {
          throw error;
        });
      }
    });
    feed.on('error', function(e) {
      throw e;
    })
  }
  catch(e) {
    throw e;
  }
})
it('`on` should work on cursor - a `end` event shoul be eventually emitted on a cursor', async () => {
  try {
    cursor = await r.db(dbName).table(tableName2).run({cursor: true});
    setTimeout(function() {
      r.db(dbName).table(tableName2).update({foo: r.now()}).run();
    }, 100)
    cursor.on('end', function() {
      return;
    });
    cursor.on('error', function(e) {
      throw e;
    })
  }
  catch(e) {
    throw e;
  }
})

it('`next`, `each`, `toArray` should be deactivated if the EventEmitter interface is used', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).update({foo: r.now()}).run();
    }, 100)
    feed.on('data', function() { });
    feed.on('error', function(error) {
      throw error;
    });
    assert.throws(function() {
      feed.next();
    }, function(e) {
      if (e.message === 'You cannot call `next` once you have bound listeners on the Feed.') {
        feed.close().then(function() {

        }).error(function(error) {
          throw error;
        });
      }
      else {
        throw e;
      }
      return true;
    })
  }
  catch(e) {
    throw e;
  }
})

it('Import with cursor as default', async () => {
  await util.sleep(1000);
  let r1 = require('../lib')({cursor: true, host: config.host, port: config.port, authKey: config.authKey, buffer: config.buffer, max: config.max, silent: true});
  let i=0;
  try {
    cursor = await r1.db(dbName).table(tableName).run();
    assert.equal(cursor.toString(), '[object Cursor]');
    await cursor.close();

  }
  catch(e) {
    throw e;
  }
})
it('`each` should not return an error if the feed is closed - 1', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).limit(2).update({foo: r.now()}).run();
    }, 100)
    let count = 0;
    feed.each(function(err, result) {
      if (result.new_val.foo instanceof Date) {
        count++;
      }
      if (count === 1) {
        setTimeout(function() {
          feed.close().then(function() {

          }).error(done);
        }, 100);
      }
    });
  }
  catch(e) {
    throw e;
  }
})
it('`each` should not return an error if the feed is closed - 2', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).limit(2).update({foo: r.now()}).run();
    }, 100)
    let count = 0;
    feed.each(function(err, result) {
      if (result.new_val.foo instanceof Date) {
        count++;
      }
      if (count === 2) {
        setTimeout(function() {
          feed.close().then(function() {

          }).error(done);
        }, 100);
      }
    });
  }
  catch(e) {
    throw e;
  }
})
it('events should not return an error if the feed is closed - 1', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).get(1).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).insert({id: 1}).run();
    }, 100)
    feed.each(function(err, result) {
      if (err) {
        return throw err;
      }
      if ((result.new_val != null) && (result.new_val.id === 1)) {
        feed.close().then(function() {

        }).error(done);
      }
    });
  }
  catch(e) {
    throw e;
  }
})
it('events should not return an error if the feed is closed - 2', async () => {
  try {
    feed = await r.db(dbName).table(tableName2).changes().run();
    setTimeout(function() {
      r.db(dbName).table(tableName2).limit(2).update({foo: r.now()}).run();
    },100)
    let count = 0;
    feed.on('data', function(result) {
      if (result.new_val.foo instanceof Date) {
        count++;
      }
      if (count === 1) {
        setTimeout(function() {
          feed.close().then(function() {

          }).error(done);
        }, 100);
      }
    });
  }
  catch(e) {
    throw e;
  }
})
it('`includeStates` should work', async () => {
  try {
    feed = await r.db(dbName).table(tableName).orderBy({index: 'id'}).limit(10).changes({includeStates: true, includeInitial: true}).run();
    let i = 0;
    feed.each(function(err, change) {
      i++;
      if (i === 10) {
        feed.close();

      }
    });
  }
  catch(e) {
    throw e;
  }
})
it('`each` should return an error if the connection dies', async () => {
  let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
  assert(connection);

  let feed = await r.db(dbName).table(tableName).changes().run(connection);
  feed.each(function(err, change) {
    assert(err.message.match(/^The connection was closed before the query could be completed for/))

  });
  // Kill the TCP connection
  connection.connection.end()
})
it('`eachAync` should return an error if the connection dies', async () => {
  let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
  assert(connection);

  let feed = await r.db(dbName).table(tableName).changes().run(connection);
  feed.eachAsync(function(change) {}).error(function(err) {
    assert(err.message.match(/^The connection was closed before the query could be completed for/))

  });
  // Kill the TCP connection
  connection.connection.end()
})


