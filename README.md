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

# TODO:

* Pretty print backtraces
* Make an exception enum and utility functions for filtering and handling the right exceptions
* Translate the fixed tests to TS and run all the tests
* Fork this to RebirthDB org, add build step & publish
