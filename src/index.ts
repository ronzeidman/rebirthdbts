import { NULL_BUFFER } from './handshake';
import { Term } from './proto/ql2';
import { RebirthDBSocket } from './socket';

(async ({ user = 'admin', password = NULL_BUFFER } = {}) => {
  try {
    const rsocket = new RebirthDBSocket();
    await rsocket.connect();
    console.log('Connected!');
    const dbTerm = [Term.TermType.DB, ['test_db']];
    const tableTerm = [Term.TermType.TABLE, [dbTerm, 'test_table']];
    console.log(await rsocket.query(tableTerm));
  } catch (error) {
    console.log(error);
  }
})();
