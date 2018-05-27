import { inspect } from 'util';
import { NULL_BUFFER } from './handshake';
import { r } from './query-builder';

// Term.TermType.DB;

(async ({ user = 'admin', password = NULL_BUFFER } = {}) => {
  try {
    const conn = await r.connect({ pool: false });
    const result = await r
      .db('test_db')
      .table('test_table')
      .run(conn);
    console.log(inspect(result));
  } catch (error) {
    console.log(error);
  }
})();
