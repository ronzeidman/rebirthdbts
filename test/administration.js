const path = require('path')
const config = require(path.join(__dirname, '/config.js'))
const rethinkdbdash = require(path.join(__dirname, '/../lib'))
const util = require(path.join(__dirname, '/util/common.js'))
const assert = require('assert')
const uuid = util.uuid


describe('administration', () => {
  let r, dbName, tableName, result

  before(async () => {
    r = await rethinkdbdash(config)

    dbName = uuid()
    tableName = uuid()

    result = await r.dbCreate(dbName).run()
    assert.equal(result.dbs_created, 1)

    result = await r.db(dbName).tableCreate(tableName).run()
    assert.equal(result.tables_created, 1)

    result = await r.db(dbName).table(tableName).insert(Array(100).fill({})).run()
    assert.equal(result.inserted, 100)
    assert.equal(result.generated_keys.length, 100)
  })

  after(async () => {
    await r.getPoolMaster().drain()
  })

  it('`config` should work', async function () {
    result = await r.db(dbName).config().run()
    assert.equal(result.name, dbName)

    result = await r.db(dbName).table(tableName).config().run()
    assert.equal(result.name, tableName)
  })

  it('`config` should throw if called with an argument', async function () {
    try {
      await r.db(dbName).config('hello').run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`config` takes 0 argument, 1 provided after:/))
    }
  })

  it('`status` should work', async function () {
    result = await r.db(dbName).table(tableName).status().run()
    assert.equal(result.name, tableName)
    assert.notEqual(result.status, undefined)
  })

  it('`status` should throw if called with an argument', async function () {
    try {
      await r.db(dbName).table(tableName).status('hello').run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`status` takes 0 argument, 1 provided after:/))
    }
  })

  it('`wait` should work', async function () {
    result = await r.db(dbName).table(tableName).wait().run()
    assert.equal(result.ready, 1)
  })

  it('`wait` should work with options', async function () {
    result = await r.db(dbName).table(tableName).wait({waitFor: 'ready_for_writes'}).run()
    assert.equal(result.ready, 1)

    result = await r.db(dbName).table(tableName).wait({waitFor: 'ready_for_writes', timeout: 2000}).run()
    assert.equal(result.ready, 1)
  })

  it('`r.wait` should throw', async function () {
    try {
      await r.wait().run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`wait` can only be called on a table or a database since 2.3./))
    }
  })

  it('`wait` should throw if called with 2 arguments', async function () {
    try {
      await r.db(dbName).table(tableName).wait('hello', 'world').run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`wait` takes at most 1 argument, 2 provided after:/))
    }
  })

  it('`reconfigure` should work - 1', async function () {
    result = await r.db(dbName).table(tableName).reconfigure({shards: 1, replicas: 1}).run()
    assert.equal(result.reconfigured, 1)
  })

  it('`reconfigure` should work - 2 - dryRun', async function () {
    result = await r.db(dbName).table(tableName).reconfigure({shards: 1, replicas: 1, dryRun: true}).run()
    assert.equal(result.reconfigured, 0)
  })

  it('`r.reconfigure` should throw', async function () {
    try {
      result = await r.reconfigure().run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`reconfigure` can only be called on a table or a database since 2.3./))
    }
  })

  it('`reconfigure` should throw on an unrecognized key', async function () {
    try {
      result = await r.db(dbName).table(tableName).reconfigure({foo: 1}).run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^Unrecognized option `foo` in `reconfigure` after:/))
    }
  })

  it('`reconfigure` should throw on a number', async function () {
    try {
      result = await r.db(dbName).table(tableName).reconfigure(1).run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^First argument of `reconfigure` must be an object./))
    }
  })

  it('`rebalanced` should work - 1', async function () {
    result = await r.db(dbName).table(tableName).rebalance().run()
    assert.equal(result.rebalanced, 1)
  })

  it('`r.rebalance` should throw', async function () {
    try {
      result = await r.rebalance().run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`rebalance` can only be called on a table or a database since 2.3./))
    }
  })

  it('`rebalance` should throw if an argument is provided', async function () {
    try {
      result = await r.db(dbName).table(tableName).rebalance(1).run()
      assert.fail('should throw')
    } catch (e) {
      assert(e.message.match(/^`rebalance` takes 0 argument, 1 provided after:/))
    }
  })
})
