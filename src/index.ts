import { NULL_BUFFER } from './handshake';
import { r } from './query-builder';
import { RebirthDBSocket } from './socket';

// Term.TermType.DB;

(async ({ user = 'admin', password = NULL_BUFFER } = {}) => {
  try {
    const rsocket = new RebirthDBSocket();
    await rsocket.connect();
    console.log('Connected!');
    console.log(await rsocket.query(r.db('test').table('test')));
  } catch (error) {
    console.log(error);
  }
})();
