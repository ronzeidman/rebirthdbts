//tslint:disable
import assert from 'assert';
import { Connection, r } from '../src';
import * as baseConfig from './config';
import { uuid } from './util/common';

const config = { ...baseConfig, pool: false as false, silent: true };
let connection: Connection; // global connection
let dbName: string;
let tableName: string;
let result: any;

it('Testing `run` without connection', async () => {
  try {
    await r.expr(1).run();
  } catch (e) {
    assert.equal(
      e.message,
      '`run` was called without a connection and no pool has been created after:\nr.expr(1)'
    );
  }
});

it('Testing `run` with a closed connection', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);
    connection.close();
    await r.expr(1).run(connection);
  } catch (e) {
    if (
      e.message ===
      '`run` was called with a closed connection after:\nr.expr(1)'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('Init for `cursor.js`', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);

    dbName = uuid();
    const tableName = uuid();

    let result: any = await r.dbCreate(dbName).run(connection);
    assert.equal(result.config_changes.length, 1);
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run(connection);
    assert.equal(result.tables_created, 1);

    result = await r
      .db(dbName)
      .table(tableName)
      .insert(eval('[' + new Array(100).join('{}, ') + '{}]'))
      .run(connection);
    assert.equal(result.inserted, 100);

    return;
  } catch (e) {
    throw e;
  }
});

it('`run` should use the default database', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    let result: any = await r.dbCreate(dbName).run(connection);
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run(connection);
    assert.equal(result.tables_created, 1);

    result = await connection.close();

    connection = await r.connect({
      pool: false,
      db: dbName,
      servers: [{ host: config.host, port: config.port }],
      password: config.authKey
    });
    assert(connection);

    result = await r.tableList().run(connection);
    assert.deepEqual(result, [tableName]);

    return;
  } catch (e) {
    throw e;
  }
});
it('`use` should work', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    let result: any = await r.dbCreate(dbName).run(connection);
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run(connection);
    assert.equal(result.tables_created, 1);

    connection.use(dbName);

    result = await r.tableList().run(connection);
    assert.deepEqual(result, [tableName]);

    return;
  } catch (e) {
    throw e;
  }
});
it('`reconnect` should work', async () => {
  try {
    let result: any = await r.expr(1).run(connection);
    assert.equal(result, 1);

    result = await connection.close();

    assert(connection);
    connection = await connection.reconnect();
    assert(connection);

    result = await r.tableList().run(connection);
    assert.deepEqual(result, [tableName]);

    return;
  } catch (e) {
    throw e;
  }
});
it('`reconnect` should work with options', async () => {
  try {
    let result: any = await r.expr(1).run(connection);
    assert.equal(result, 1);

    assert(connection);
    connection = await connection.reconnect({ noreplyWait: true });
    assert(connection);

    result = await r.expr(1).run(connection);
    assert.equal(result, 1);

    connection = await connection.reconnect({ noreplyWait: false });
    assert(connection);

    result = await r.expr(1).run(connection);
    assert.equal(result, 1);

    connection = await connection.reconnect();
    assert(connection);

    result = await r.expr(1).run(connection);
    assert.equal(result, 1);

    return;
  } catch (e) {
    throw e;
  }
});

it('`noreplyWait` should work', async () => {
  try {
    result = await connection.noreplyWait();
    return;
  } catch (e) {
    throw e;
  }
});

it('`run` should take an argument', async () => {
  try {
    let result: any = await connection.close();
    assert(connection);
    connection = await r.connect(config);
    assert(connection);

    result = await r.expr(1).run(connection, { readMode: 'single' });
    assert.equal(result, 1);

    result = await r.expr(1).run(connection, { readMode: 'majority' });
    assert.equal(result, 1);

    result = await r.expr(1).run(connection, { profile: false });
    assert.equal(result, 1);

    result = await r.expr(1).run(connection, { profile: true });
    assert(result.profile);
    assert.equal(result.result, 1);

    result = await r.expr(1).run(connection, { durability: 'soft' });
    assert.equal(result, 1);

    result = await r.expr(1).run(connection, { durability: 'hard' });
    assert.equal(result, 1);

    return;
  } catch (e) {
    throw e;
  }
});

it('`run` should throw on an unrecognized argument', async () => {
  try {
    result = await r.expr(1).run(connection, { foo: 'bar' });
  } catch (e) {
    if (
      e.message === 'Unrecognized global optional argument `foo`.'
      // 'Unrecognized option `foo` in `run`. Available options are readMode <string>, durability <string>, noreply <bool>, timeFormat <string>, groupFormat: <string>, profile <bool>, binaryFormat <bool>, cursor <bool>, stream <bool>.'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('`r()` should be a shortcut for r.expr()', async () => {
  try {
    result = await r(1).run(connection);
    assert.deepEqual(result, 1);
    return;
  } catch (e) {
    throw e;
  }
});

it('`timeFormat` should work', async () => {
  try {
    result = await r.now().run(connection);
    assert(result instanceof Date);

    result = await r.now().run(connection, { timeFormat: 'native' });
    assert(result instanceof Date);

    result = await r.now().run(connection, { timeFormat: 'raw' });
    assert.equal(result.$reql_type$, 'TIME');

    return;
  } catch (e) {
    throw e;
  }
});
it('`binaryFormat` should work', async () => {
  try {
    result = await r
      .binary(new Buffer([1, 2, 3]))
      .run(connection, { binaryFormat: 'raw' });
    assert.equal(result.$reql_type$, 'BINARY');

    return;
  } catch (e) {
    throw e;
  }
});

it('`groupFormat` should work', async () => {
  try {
    let result: any = await r
      .expr([
        { name: 'Michel', grownUp: true },
        { name: 'Laurent', grownUp: true },
        { name: 'Sophie', grownUp: true },
        { name: 'Luke', grownUp: false },
        { name: 'Mino', grownUp: false }
      ])
      .group('grownUp')
      .run(connection, { groupFormat: 'raw' });

    assert.deepEqual(result, {
      $reql_type$: 'GROUPED_DATA',
      data: [
        [
          false,
          [{ grownUp: false, name: 'Luke' }, { grownUp: false, name: 'Mino' }]
        ],
        [
          true,
          [
            { grownUp: true, name: 'Michel' },
            { grownUp: true, name: 'Laurent' },
            { grownUp: true, name: 'Sophie' }
          ]
        ]
      ]
    });

    return;
  } catch (e) {
    throw e;
  }
});

it('`profile` should work', async () => {
  try {
    result = await r.expr(true).run(connection, { profile: false });
    assert(result);

    result = await r.expr(true).run(connection, { profile: true });
    assert(result.profile);
    assert.equal(result.result, true);

    result = await r.expr(true).run(connection, { profile: false });
    assert.equal(result, true);

    return;
  } catch (e) {}
});

it('Test error message when running a query on a closed connection', async () => {
  try {
    await connection.close();
    await r.expr(1).run(connection);
  } catch (e) {
    if (e.message.match('`run` was called with a closed connection after:')) {
      return;
    } else {
      throw e;
    }
  }
});

it('Test timeout', async () => {
  let server;
  let port = 0;
  try {
    port = Math.floor(Math.random() * (65535 - 1025) + 1025);

    server = require('net')
      .createServer(function() {})
      .listen(port);

    connection = await r.connect({
      pool: false,
      servers: [{ host: 'localhost', port }],
      timeout: 1
    });
    throw new Error('Was expecting an error');
  } catch (err) {
    // close server
    if (
      err.message ===
      'Failed to connect to localhost:' + port + ' in less than 1s.'
    ) {
      return;
    } else {
      throw err;
    }
  }
});

it('`server` should work', async () => {
  try {
    connection = await r.connect(config);
    const response = await connection.server();
    assert(typeof response.name === 'string');
    assert(typeof response.id === 'string');
    return;
  } catch (e) {
    throw e;
  }
});

it('`grant` should work', async () => {
  try {
    connection = await r.connect(config);
    assert(connection);

    const restrictedDbName = uuid();
    const restrictedTableName = uuid();

    result = await r.dbCreate(restrictedDbName).run(connection);
    assert.equal(result.config_changes.length, 1);
    assert.equal(result.dbs_created, 1);
    result = await r
      .db(restrictedDbName)
      .tableCreate(restrictedTableName)
      .run(connection);
    assert.equal(result.tables_created, 1);

    const user = uuid();
    const password = uuid();
    result = await r
      .db('rethinkdb')
      .table('users')
      .insert({
        id: user,
        password: password
      })
      .run(connection);
    result = await r
      .db(restrictedDbName)
      .table(restrictedTableName)
      .grant(user, {
        read: true,
        write: true,
        config: true
      })
      .run(connection);
    assert.deepEqual(result, {
      granted: 1,
      permissions_changes: [
        {
          new_val: {
            config: true,
            read: true,
            write: true
          },
          old_val: null
        }
      ]
    });

    return;
  } catch (e) {
    throw e;
  }
});

it('If `servers` is specified, it cannot be empty', async () => {
  try {
    await r.connect({
      servers: []
    });
  } catch (e) {
    assert.equal(
      e.message,
      'If `servers` is an array, it must contain at least one server.'
    );
    return;
  }
});
