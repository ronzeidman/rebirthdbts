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

- Fully working typescript driver!
- Rebuilt from scrach using the latest ES/TS features for readability and maintainability
- Drop-in replacement for rethinkdbdash with only some minor changes

# CHANGES FROM RETHINKDBDASH

- Importing property instead of entire library: `const {r} = require('rebirthdbts')` or `import {r} from 'rebirthdbts'` instead of `const r = require('rethinkdbdash')(options)`
- No top level initialization, initializing a pool is done by `await r.connectPool()`
- No `{ cursor: true }` option, for getting a cursor use `.getCursor(runOptions)` instead of `.run(runOptions)`
  - `.run()` will coerce streams to array by default feeds will return a cursor like rethinkdbdash
- Uses native promises instead of `bluebird`
- A cursor is already a readable stream, no need for `toStream()`
- A readable stream is already an async iterator in node 10 no need for `.asyncIterator()`
- In connction pool, reusing open connections that already run queries instead of making queries wait for a connection when max connections exceeded.
- Integrated fully encompasing type definitions

# DROPPING SUPPORT:

- Support node < 8
- Support callbacks.
- Support using `.then()` directly on a query (optionalRun), it can confuse users that queries are promises leading to false assumptions:
  - Queries are not promises since they are not eagerly evaluated and therefore they can:
    - `.run()` as many times as you want (promises run only once and return the same value without running other times)
    - be stored for future evaluation (promises run as you create them)
- Support browsers (Unless it's the only demand of making this driver used instead of rethinkdbdash)
- support for `r.row` you can use `row => row` instead. (may add support in the future)
- Support write streams (Does anyone uses it? will add it if its a popular demand)
- Multiple connection pools (if someone has a good usecase I'll support it)

# TASKS REMAINING BEFORE RELEASE:

## Priority - medium

- Pretty print error backtraces
- Removing or fixing all unwanted tests
- Translate tests to TS
- Add travis build step
- Get forked into RebirthDB org
- Publish in NPM
- Go through all type definitions and fix according to config (maybe use https://github.com/rethinkdb/rethinkdb/blob/3edaeceb71c2caf1203025a752f61786364528ed/drivers/java/term_info.json)

## Priority - low

- New API tests (write hooks and bit ops)
- Supporting implicit var (`r.row`)
  - Use a lambda expression instead (row => row)

## Priority - none

- Don't throw on `r.expr(NaN)` (only on `r.expr(NaN).run()`). Why? (test: `r.expr` should not NaN if not run)
- Client backtraces - because of the above NaN values throw in the right callstack (line + col) so backtraces are not nessesary
- Function suggestions fails ("`noReplyWait` should throw")
  - Typescript can help users better understand the right function names
- Suggesting optional arguments available options fails ("`run` should throw on an unrecognized argument")
  - still showing wrong argument exception + backtrace
  - Typescript can help users better understand the right params
- Not supporting certain top-level functions ("`r.wait` should throw")
  - Every not top level function can be translated to top level function by adding the query-term as the first arg: `r.table('test').reconfigure({...})` -> `r.reconfigure(r.table('test'), { ... })`
  - This support will help make use of the future `|>` functional operator:
    - this.table('test') |> r.reconfigure(#, {})
- Throw special error if a top-level function is not defined on a term ("`js` is not defined after a term")
  - Throwing the standard `TypeError: xxx is not a function`
- Supporting `.asyncIterator()`
  - Cursor is a stream reader which is an async iterator by default in node 10
- Special r.time arity check (the current check is enough)
- Error message mismatch
- `r.and()` `r.or()` with no arguments
