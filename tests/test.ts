// import { Connection, r } from '../src';
// // let connection: Connection; // global connection
// // let dbName: string;
// // let tableName: string;
// // let result: any;
// (async () => {
//   // const conn = await r.connect({ ...config, pool: false });
//   // await r.connect(config);
//   await r.expr(1).run();
//   // console.log(JSON.stringify(await r.expr(1).run({ foo: 'bar' } as any));
//   process.exit();
// })();
// function dbCleanup(conn?: Connection) {
//   return Promise.all([
//     r
//       .db('rethinkdb')
//       .table('users')
//       .filter(row => row('id').ne('admin'))
//       .delete()
//       .run(conn),
//     r
//       .dbList()
//       .filter(db =>
//         r
//           .expr(['rethinkdb'])
//           .contains(db)
//           .not()
//       )
//       .forEach(db => r.dbDrop(db))
//       .run(conn)
//   ]);
// }
