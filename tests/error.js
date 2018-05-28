import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;

it("ReqlResourceError", async () => {
  try {
    result = await r.expr([1,2,3,4]).run({arrayLimit: 2});
  }
  catch(e) {
    assert.equal(e.name, 'ReqlResourceError');
    return;
  }
})
it("ReqlLogicError", async () => {
  try {
    result = await r.expr(1).add("foo").run();
  }
  catch(e) {
    assert.equal(e.name, 'ReqlLogicError');
    return;
  }
})

it("ReqlOpFailedError", async () => {
  try {
    result = await r.db('DatabaseThatDoesNotExist').tableList().run();
  }
  catch(e) {
    assert.equal(e.name, 'ReqlOpFailedError');
    return;
  }
})

it("ReqlUserError", async () => {
  try {
    result = await r.branch(r.error('a'), 1, 2).run()
  }
  catch(e) {
    assert.equal(e.name, 'ReqlUserError');
    return;
  }
})

// Missing tests for ReqlInternalError and ReqlOpIndeterminateError
// as there are no easy way to trigger those
