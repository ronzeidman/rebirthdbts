// 0 passing (10ms)
// 1 failing
import * as path from 'path';
const { TermType } = require(path.join(__dirname, '/../lib/proto/enums.js'));
const fs = require('fs');
const keys = Object.keys(TermType)
  .filter(key => isNaN(key))
  .map(key => TermType[key]);

import assert from 'assert';

describe('coverage', () => {
  // Test that the term appears somewhere in the file, which find terms that were not implemented
  it('all terms should be present in query-config.js', async () => {
    const queryConfig = require(path.join(
      __dirname,
      '/../lib/query-builder/query-config.js'
    ));
    const ignoredKeys = [
      TermType.FUNC,
      TermType.VAR,
      TermType.IMPLICIT_VAR,
      // not implemented since we use the JSON protocol
      TermType.MAKE_ARRAY,
      TermType.DATUM,
      TermType.MAKE_OBJ,
      TermType.BETWEEN_DEPRECATED
    ];
    const missing = [];
    const supportedTerms = [
      queryConfig.bracket[0],
      queryConfig.funcall[0],
      ...queryConfig.termConfig.map(t => t[0]),
      ...queryConfig.rConfig.map(t => t[0]),
      ...queryConfig.rConsts.map(t => t[0])
    ];
    for (const key of keys) {
      if (ignoredKeys.includes(key)) {
        continue;
      }
      if (!supportedTerms.includes(key)) {
        missing.push(TermType[key]);
      }
    }

    if (missing.length > 0) {
      assert.fail('Some terms were not found:', JSON.stringify(missing));
    }
  });
});
