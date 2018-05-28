import * as config from './config';
let r = require(__dirname+'/../lib')({pool: false});
let r_ = require(__dirname+'/../lib')(config);
import { uuid } from './util/common';
import assert from 'assert';




let connection; // global connection
let dbName, tableName, result;

it('Testing valid syntax for `run` - 1', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);

    result = r.expr(1).run(connection, function(err, result) {
      assert.equal(err, null);
      assert.equal(result, 1);

    });
  }
  catch(e) {
    throw e;
  }
})
it('Testing valid syntax for `run` - 2', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);

    result = await r.now().run(connection, {timeFormat: "raw"})
    assert.equal(result.$reql_type$, "TIME");

  }
  catch(e) {
    throw e;
  }
})
it('Testing valid syntax for `run` - 3', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);

    result = r.now().run(connection, {timeFormat: "raw"}, function(err, result) {
      assert.equal(err, null);
      assert.equal(result.$reql_type$, "TIME");

    });
  }
  catch(e) {
    throw e;
  }
})
it('Testing valid syntax for `run` - 4', async () => {
  try {
    result = await r_.now().run({timeFormat: "raw"})
    assert.equal(result.$reql_type$, "TIME");

  }
  catch(e) {
    throw e;
  }
})
it('Testing valid syntax for `run` - 5', async () => {
  try {
    result = await r_.now().run(function(err, result) {
      assert.equal(err, null);
      assert(result instanceof Date);

    })
  }
  catch(e) {
    throw e;
  }
})
it('Testing valid syntax for `run` - 6', async () => {
  try {
    result = await r_.now().run({timeFormat: "raw"}, function(err, result) {
      assert.equal(err, null);
      assert.equal(result.$reql_type$, "TIME");

    })
  }
  catch(e) {
    throw e;
  }
})


it('Testing r.connect with a callback - 1', async () => {
  r.connect(config, function(err, conn) {
    assert.equal(err, null);
    conn.close();
    return;
  })
})
it('Testing r.connect with a callback - 2', async () => {
  r.connect(function(err, conn) {
    // This may or may not succeed, depending on the config file
    return;
  })
})
it('Testing conn.reconnect with a callback', async () => {
  r.connect(config, function(err, conn) {
    assert.equal(err, null);
    conn.reconnect(function(err, conn) {
      // This may or may not succeed, depending on the config file
      return;
    });
  })
})
it('Testing conn.close with a callback - 1', async () => {
  r.connect(config, function(err, conn) {
    assert.equal(err, null);
    conn.close(function(err, conn) {
      // This may or may not succeed, depending on the config file
      return;
    });
  })
})
it('Testing conn.close with a callback - 2', async () => {
  r.connect(config, function(err, conn) {
    assert.equal(err, null);
    conn.close({noreplyWait: true}, function(err, conn) {
      // This may or may not succeed, depending on the config file
      return;
    });
  })
})
it('Testing conn.noreplyWait with a callback', async () => {
  r.connect(config, function(err, conn) {
    assert.equal(err, null);
    conn.noreplyWait(function(err, conn) {
      // This may or may not succeed, depending on the config file
      return;
    });
  })
})
it('Testing cursor.toArray with a callback', async () => {
  r_.expr([1,2,3]).run({cursor: true}, function(err, cursor) {
    assert.equal(err, null);
    cursor.toArray(function(err, result) {
      assert.equal(err, null);
      assert.deepEqual(result, [1,2,3]);

    });
  })
})
it('Testing cursor.next with a callback', async () => {
  r_.expr([1,2,3]).run({cursor: true}, function(err, cursor) {
    assert.equal(err, null);
    cursor.next(function(err, result) {
      assert.equal(err, null);
      assert.deepEqual(result, 1);
      cursor.close();

    });
  })
})
it('Testing cursor.close with a callback', async () => {
  r_.expr([1,2,3]).run({cursor: true}, function(err, cursor) {
    assert.equal(err, null);
    cursor.close(function(err, result) {

    });
  })
})
it('Testing cursor.close with a callback when already closed', async () => {
  r_.expr([1,2,3]).run({cursor: true}, function(err, cursor) {
    assert.equal(err, null);
    cursor.close(function(err, result) {
      cursor.close(function(err, result) {

      });
    });
  })
})
