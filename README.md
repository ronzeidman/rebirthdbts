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

# NEW FEATURES:

* No dependencies
* Closing a cursor works and throws on a cursor that's waiting in `await cursor.next()`
* `isHealthy` on pools and `isConnected` on a connection
* API of getting the actual underlying connections from a pool
* Can restart a drained master pool
* Better connection handling and rebalancing
* Reusing open connections that already run queries instead of making them wait for a connection
* Integrated fully encompasing type definitions
* `immidiateReturn` will always return a Cursor, and will do it immidiately. In the official and rethinkdbdash you need to wait for the first results to arrive after sending the query. This makes it impossible to cancel (unless you close the underlying connection)

# NOT DOING:

* Support node < 8
* Support callbacks.
* Support using `.then()` directly on a query (optionalRun), doesn't feel right to me.
* Arrays by default.
  * use the provided `isCursor` to handle any type of result
* Top level init function like in rethinkdbdash:
  * use `await r.connectPool()` instead - it can initialize the pool and restart it if needed.
* Support browsers (Unless it's the only demand of making this driver used instead of rethinkdbdash)

# MAYBE DOING:
* Support `r.row`, use `row => row` instead for now
* Pretty print backtraces
* Support streams (Does anyone uses it?)

# TODO:

* Make an exception enum and utility functions for filtering and handling the right exceptions
* Translate the fixed tests to TS and run all the tests
* Fork this to RebirthDB org, add build step & publish
