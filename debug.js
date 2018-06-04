const { r } = require('./lib');
const config = require('./test/config');
const { uuid } = require('./test/util/common');
const assert = require('assert');
const numDocs = 100; // Number of documents in the "big table" used to test the SUCCESS_PARTIAL
const smallNumDocs = 5; // Number of documents in the "small table"
const options = {
  max: 10,
  buffer: 2,
  servers: [
    {
      host: config.host,
      port: config.port
    }
  ],
  authKey: config.authKey,
  discovery: false,
  silent: true
};

(async () => {
  await r.connectPool({
    buffer: 1,
    max: 2,
    silent: true,
    timeout: 9999999
  }).catch(console.error);
  await r.getPoolMaster().drain();
  console.log(await r.expr(1).run())
})()
