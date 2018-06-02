const { r } = require('./lib');
const config = require('./test/config');
const { uuid } = require('./test/util/common');
const assert = require('assert');
const numDocs = 100; // Number of documents in the "big table" used to test the SUCCESS_PARTIAL
const smallNumDocs = 5; // Number of documents in the "small table"

(async () => {
  await r.connectPool(config)
  // let dbName = uuid()
  // let tableName = uuid()

  // let result = await r.dbCreate(dbName).run()
  // assert.equal(result.dbs_created, 1)

  // result = await r.db(dbName).tableCreate(tableName).run()
  // assert.equal(result.tables_created, 1)

  // result = await r.db(dbName).table(tableName).insert(Array(100).fill({})).run()
  // assert.equal(result.inserted, 100)
  // assert.equal(result.generated_keys.length, 100)
  const res = await r.branch(
    r.expr(5).eq(0),
    r.expr(23).eq(r.now().inTimezone('-09:00').hours()),
    r.expr(5).eq(r.now().inTimezone('-09:00').hours().add(1))
  ).run().catch(console.error);
})();