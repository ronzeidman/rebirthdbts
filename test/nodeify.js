const path = require('path')
const config = require('./config.js')
const { r } = require(path.join(__dirname, '/../lib'))
const assert = require('assert')


describe('nodeify', () => {
  describe('no pool', () => {


    before(async function () {
      r = await rethinkdbdash({ pool: false })
    })

    it('Testing valid syntax for `run` - 1', async function () {
      const connection = await r.connect(config)
      assert(connection)

      await r.expr(1).run(connection, function (err, result) {
        assert.ifError(err)
        assert.equal(result, 1)
      })
      await connection.close()
    })

    it('Testing valid syntax for `run` - 2', async function () {
      const connection = await r.connect(config)
      assert(connection)

      const result = await r.now().run(connection, { timeFormat: 'raw' })
      assert.equal(result.$reql_type$, 'TIME')

      await connection.close()
    })

    it('Testing valid syntax for `run` - 3', async function () {
      const connection = await r.connect(config)
      assert(connection)

      await r.now().run(connection, { timeFormat: 'raw' }, function (err, result) {
        assert.ifError(err)
        assert.equal(result.$reql_type$, 'TIME')
      })
      await connection.close()
    })

    it('Testing r.connect with a callback - 1', async function () {
      await r.connect(config, function (err, conn) {
        assert.ifError(err)
        conn.close()
      })
    })

    it('Testing r.connect with a callback - 2', async function () {
      await r.connect(function (err, conn) {
        assert.ifError(err)
        conn.close()
      })
    })

    it('Testing conn.reconnect with a callback', async function () {
      await r.connect(config, function (err, conn) {
        assert.ifError(err)
        conn.reconnect(function (err, conn) {
          assert.ifError(err)
          conn.close()
        })
      })
    })

    it('Testing conn.close with a callback - 1', async function () {
      await r.connect(config, function (err, conn) {
        assert.ifError(err)
        conn.close()
      })
    })

    it('Testing conn.close with a callback - 2', async function () {
      await r.connect(config, function (err, conn) {
        assert.ifError(err)
        conn.close({ noreplyWait: true }, assert.ifError)
      })
    })

    it('Testing conn.noreplyWait with a callback', async function () {
      await r.connect(config, function (err, conn) {
        assert.ifError(err)
        conn.noreplyWait(() => conn.close())
      })
    })
  })

  describe('connection pool', () => {
    let r_

    before(async function () {
      await r.connectPool(config)
    })

    after(async function () {
      await r_.getPoolMaster().drain()
    })

    it('Testing valid syntax for `run` - 4', async function () {
      const result = await r_.now().run({ timeFormat: 'raw' })
      assert.equal(result.$reql_type$, 'TIME')
    })

    it('Testing valid syntax for `run` - 5', async function () {
      const result = await r_.now().run(function (err, result) {
        assert.ifError(err)
        return result
      })
      assert(result instanceof Date)
    })

    it('Testing valid syntax for `run` - 6', async function () {
      await r_.now().run({ timeFormat: 'raw' }, function (err, result) {
        assert.ifError(err)
        assert.equal(result.$reql_type$, 'TIME')
      })
    })

    it('Testing cursor.toArray with a callback', async function () {
      await r_.expr([1, 2, 3]).getCursor({}, function (err, cursor) {
        assert.ifError(err)
        cursor.toArray(function (err, result) {
          assert.ifError(err)
          assert.deepEqual(result, [1, 2, 3])
        })
      })
    })

    it('Testing cursor.next with a callback', async function () {
      r_.expr([1, 2, 3]).getCursor({}, function (err, cursor) {
        assert.ifError(err)
        cursor.next(function (err, result) {
          assert.ifError(err)
          assert.deepEqual(result, 1)
        })
      })
    })

    it('Testing cursor.close with a callback', async function () {
      await r_.expr([1, 2, 3]).getCursor({}, function (err, cursor) {
        assert.ifError(err)
        cursor.close()
      })
    })

    it('Testing cursor.close with a callback when already closed', async function () {
      await r_.expr([1, 2, 3]).getCursor({}, function (err, cursor) {
        assert.ifError(err)
        cursor.close(function (err) {
          assert.ifError(err)
          cursor.close()
        })
      })
    })
  })
})
