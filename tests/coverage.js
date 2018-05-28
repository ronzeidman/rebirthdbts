import { uuid } from './util/common';


let protodef = require(__dirname+'/../lib/protodef.js');
let keys = Object.keys(protodef.Term.TermType);

let fs = require('fs');

// Test that the term appears somewhere in the file, which find terms that were not implemented
it('All terms should be present in term.js', async () => {
  let str = fs.readFileSync(__dirname+'/../lib/term.js', 'utf8');
  let ignoredKeys = { // not implemented since we use the JSON protocol
    DATUM: true,
    MAKE_OBJ: true,
    BETWEEN_DEPRECATED: true,
    ERROR: true, // define in index, error is defined for behaving like a promise
  }
  let missing = [];
  for(let i=0; i<keys.length; i++) {
    if (ignoredKeys[keys[i]] === true) {
      continue;
    }
    if (str.match(new RegExp(keys[i])) === null) {
      missing.push(keys[i]);
    }
  }

  if (missing.length > 0) {
    throw new Error('Some terms were not found: '+JSON.stringify(missing));
  }
  else {

  }

})
it('All terms should be present in error.js', async () => {
  let str = fs.readFileSync(__dirname+'/../lib/error.js', 'utf8');
  let ignoredKeys = {
    DATUM: true,
    MAKE_OBJ: true,
    BETWEEN_DEPRECATED: true,
  }
  let missing = [];
  for(let i=0; i<keys.length; i++) {
    if (ignoredKeys[keys[i]] === true) {
      continue;
    }
    if (str.match(new RegExp(keys[i])) === null) {
      missing.push(keys[i]);
    }
  }

  if (missing.length > 0) {
    throw new Error('Some terms were not found: '+JSON.stringify(missing));
  }
  else {

  }

})

