## Install

`npm i @rethinkdb/rethinkdb-ts`

or

`yarn add @rethinkdb/rethinkdb-ts`

## Import

```ts
// if you support import
import { r } from 'rethinkdb-ts';
// if you dont
const { r } = require('rethinkdb-ts');
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

- Importing property instead of entire library: `const {r} = require('rethinkdbts')` or `import {r} from 'rethinkdbts'` instead of `const r = require('rethinkdbdash')(options)`
- No top level initialization, initializing a pool is done by `await r.connectPool()`
- No `{ cursor: true }` option, for getting a cursor use `.getCursor(runOptions)` instead of `.run(runOptions)`
  - `.run()` will coerce streams to array by default feeds will return a cursor like rethinkdbdash
- Uses native promises instead of `bluebird`
- A cursor is already a readable stream, no need for `toStream()`
- A readable stream is already an async iterator in node 10 no need for `.asyncIterator()`
- In connction pool, reusing open connections that already run queries instead of making queries wait for a connection when max connections exceeded.
- Integrated fully encompasing type definitions

# NEW FEATURES

- serialize / deserialize. You can store the query as a string like this `const serializedQuery = r.table(...).filter(...).map(...).serialize()` and get it like this `r.deserialize(serializedQuery).run()` or even `r.deserialize<RStream>(serializedQuery).reduce(...).run()` the serialized query is a normal string so you can store it in the DB. No need for ugly workarounds like `.toString` and `eval` anymore. Also the serialized query is the actual JSON that gets sent to the server so it should be cross-language compatible if any other driver cares to implement it.

# DROPPING SUPPORT:

- Support node < 8
- Support callbacks.
- Support using `.then()` directly on a query (optionalRun), it can confuse users that queries are promises leading to false assumptions:
  - Queries are not promises since they are not eagerly evaluated and therefore they can:
    - `.run()` as many times as you want (promises run only once and return the same value without running other times)
    - be stored for future evaluation (promises run as you create them)
- Support browsers (Unless it's the only demand of making this driver used instead of rethinkdbdash)
- Support write streams (Does anyone uses it? will add it if its a popular demand)
- Multiple connection pools (if someone has a good usecase I'll support it)
