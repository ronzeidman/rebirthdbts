## Install

`npm i ronzeidman/rebirthdbts`

or

`yarn add https://github.com/ronzeidman/rebirthdbts.git`

## Import

```ts
// if you support import
import { r } from 'rebirthdbts';
// if you dont
const { r } = require('rebirthdbts');
```

## Initialize

```ts
// in an async context
// if you want to initialize a connection pool
await r.connectPool(options);
// if you want to initialize a single connection
const conn = await r.connect(options);
```

# STATUS:

* Fully working typescript driver!
* Rebuilt from scrach using the latest ES/TS features for readability and maintainability
* Drop-in replacement for rethinkdbdash with only some minor changes

# CHANGES FROM RETHINKDBDASH

* Importing property instead of entire library: `const {r} = require('rebirthdbts')` or `import {r} from 'rebirthdbts'` instead of `const r = require('rethinkdbdash')(options)`
* No top level initialization, initializing a pool is done by `await r.connectPool()`
* No `{ cursor: true }` option, for getting a cursor use `.getCursor(runOptions)` instead of `.run(runOptions)`
    * `.run()` with coerce streams to array by default feeds will return a cursor like rethinkdbdash
* Uses native promises instead of `bluebird`
* A cursor is already a readable stream, no need for `toStream()`
* A readable stream is already an async iterator in node 10 no need for `.asyncIterator()`
* In connction pool, reusing open connections that already run queries instead of making queries wait for a connection when max connections exceeded.
* Integrated fully encompasing type definitions

# DROPPING SUPPORT:

* Support node < 8
* Support callbacks.
* Support using `.then()` directly on a query (optionalRun), doesn't feel right to me.
* Support browsers (Unless it's the only demand of making this driver used instead of rethinkdbdash)
* support for `r.row` you can use `row => row` instead. (may add support in the future)
* Support write streams (Does anyone uses it? will add it if its a popular demand)

# TESTS ERROR STATUS:

## Priority - critical
* Support labda returning objects (test: '`merge` should take an anonymous function')

## Priority - high
* Support 'ISO8601' time format
* Support constant time terms
* Support max nesting level
* Throw on NaN and Infinity
* Support Global ArrayLimit
* Support `toString()`
* Throw on `undefined` anonymous function


## Priority - medium
* Supporting new API: `["SET_WRITE_HOOK","GET_WRITE_HOOK","BIT_AND","BIT_OR","BIT_XOR","BIT_NOT","BIT_SAL","BIT_SAR"]`
    * Need documentation
* Error names (ResourceError, LogicError)...
* Failing some geo arity tests

## Priority - low
* Supporting implicit var (`r.row`)
    * Use a lambda expression instead (row => row)

## Priority - none
* Function suggestions fails ("`noReplyWait` should throw")
    * Typescript can help users better understand the right function names
* Suggesting optional arguments available options fails ("`run` should throw on an unrecognized argument")
    * still showing wrong argument exception + backtrace
    * Typescript can help users better understand the right params
* Not supporting certain top-level functions ("`r.wait` should throw")
    * Every not top level function can be translated to top level function by adding the query-term as the first arg: `r.table('test').reconfigure({...})` -> `r.reconfigure(r.table('test'), { ... })`
    * This support will help make use of the future `|>` functional operator:
        * this.table('test') |> r.reconfigure(#, {})
* Throw special error if a top-level function is not defined on a term ("`js` is not defined after a term")
    * Throwing the standard `TypeError: xxx is not a function`
* Supporting `.asyncIterator()`
    * Cursor is a stream reader which is an async iterator by default in node 10
* Special r.time arity check (the current check is enogh)
* Error message mismatch
* `r.and()` `r.or()` with no arguments

