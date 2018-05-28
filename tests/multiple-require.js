import * as config from './config';
import { r } from '../src'; r.connect(config);
let r_ = require(__dirname+'/../lib')(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName;

it('Multiple import should not share the same pool', async () => {
  try {
    assert(r.getPoolMaster() !== r_.getPoolMaster());

  }
  catch(e) {
    throw e;
  }
})
it('Multiple import should not share the same nestingLevel value', async () => {
  try {
    r.setNestingLevel(19);
    r_.setNestingLevel(100);
    assert(r.nestingLevel !== r_.nestingLevel);
    assert.equal(r.nestingLevel, 19);
    assert.equal(r_.nestingLevel, 100);

  }
  catch(e) {
    throw e;
  }
})

it('Multiple import should not share the same `nextVarId`', async () => {
  try {
    r.expr(1).do(function(a, b, c) { return 1});
    r_.expr(2).do(function(d) { return 2});
    assert.equal(r.nextVarId, 4)
    assert.equal(r_.nextVarId, 2)

  }
  catch(e) {
    throw e;
  }
})
