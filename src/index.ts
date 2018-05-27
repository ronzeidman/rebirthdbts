import { NULL_BUFFER } from './handshake';
import { r } from './query-builder';

// Term.TermType.DB;

(async ({ user = 'admin', password = NULL_BUFFER } = {}) => {
  try {
    const conn = await r.connect({ pool: false });
    const cursor = await r
      .db('test_db')
      .table('test_table')
      // .count()
      // .filter(row => row('test_key').lt(1000))
      // .insert(
      //   Array(10000)
      //     .fill(0)
      //     .map((_, i) => ({ test_key: i }))
      // )
      .run(conn);
    // const fullResult = await cursor.toArray();
    let num = 0;
    await cursor.eachAsync(async () => console.log(num++));
  } catch (error) {
    console.error(error.stack);
  }
})();
