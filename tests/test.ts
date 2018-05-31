import { r } from '../src';
// import { Connection, r } from '../src';
import * as config from './config';
// let connection: Connection; // global connection
// let dbName: string;
// let tableName: string;
// let result: any;
(async () => {
  await r.connect(config);
  console.log(JSON.stringify(await dbCleanup(), null, '\t'));
  process.exit();
})();
function dbCleanup() {
  return Promise.all([
    r
      .db('rethinkdb')
      .table('users')
      .filter(row => row('id').ne('admin'))
      .delete()
      .run(),
    r
      .dbList()
      .filter(db =>
        r
          .expr(['rethinkdb'])
          .contains(db)
          .not()
      )
      .forEach(db => r.dbDrop(db))
      .run()
  ]);
}
