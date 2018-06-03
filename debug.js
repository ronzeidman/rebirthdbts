const { r } = require('./lib');
const config = require('./test/config');
const { uuid } = require('./test/util/common');
const assert = require('assert');
const numDocs = 100; // Number of documents in the "big table" used to test the SUCCESS_PARTIAL
const smallNumDocs = 5; // Number of documents in the "small table"

(async () => {
  await r.connectPool(config);

  // dbName = uuid();
  // tableName = uuid(); // Big table to test partial sequence
  // tableName2 = uuid(); // small table to test success sequence

  // // delete all but the system dbs
  // for (let db of await r.dbList().run()) {
  //   if (db === 'rethinkdb' || db === 'test') {
  //     continue;
  //   } else {
  //     try {
  //       await r.dbDrop(db).run();
  //     } catch (error) {
  //       assert.fail(error);
  //     }
  //   }
  // }

  // result = await r.dbCreate(dbName).run();
  // assert.equal(result.dbs_created, 1);

  // result = await r
  //   .db(dbName)
  //   .tableCreate(tableName)
  //   .run();
  // assert.equal(result.tables_created, 1);

  // result = await r
  //   .db(dbName)
  //   .tableCreate(tableName2)
  //   .run();
  // assert.equal(result.tables_created, 1);

  // feed = await r
  //   .db(dbName)
  //   .table(tableName2)
  //   .changes()
  //   .run();

  // feed.on('data', () => {});
  // feed.on('error', assert.fail);

  // try {
  //   await feed.next();
  //   assert.fail('should throw');
  // } catch (e) {
  //   console.log(e.message);
  //   assert(
  //     e.message ===
  //       'You cannot call `next` once you have bound listeners on the Feed.'
  //   );
  //   await feed.close();
  // }
  try {
    // result = await r.expr([r.monday, r.tuesday, r.wednesday, r.thursday, r.friday, r.saturday, r.sunday, r.january, r.february, r.march, r.april, r.may, r.june, r.july, r.august, r.september, r.october, r.november, r.december]).run()
    const result = await r.binary(Buffer.from([1, 2, 3, 4, 5, 6])).run();
    assert(result instanceof Buffer);
    assert.deepEqual(result.toJSON().data, [1, 2, 3, 4, 5, 6]);
    // console.log(await r.expr(NaN).run());
  } catch (err) {
    console.error(err);
  }
})();
