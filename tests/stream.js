// let config = require('./config.js');
// let r = require('../lib')(config);
// import { uuid } from './util/common';
// import assert from 'assert';
// let Readable = require('stream').Readable;

//
// let it = util.it

// let dbName, tableName, tableName2, stream, result, pks, feed, dumpTable;

// let numDocs = 100; // Number of documents in the "big table" used to test the SUCCESS_PARTIAL
// let smallNumDocs = 5; // Number of documents in the "small table"

// it('Init for `stream.js`', async () => {
//   try {
//     dbName = uuid();
//     tableName = uuid(); // Big table to test partial sequence
//     tableName2 = uuid(); // small table to test success sequence
//     dumpTable = uuid(); // dump table

//     result = await r.dbCreate(dbName).run()
//     assert.equal(result.dbs_created, 1);
//     //await r.db(dbName).wait().run()
//     result = await [
//       r.db(dbName).tableCreate(tableName)('tables_created').run(),
//       r.db(dbName).tableCreate(tableName2)('tables_created').run(),
//       r.db(dbName).tableCreate(dumpTable)('tables_created').run()]
//     assert.deepEqual(result, [1, 1, 1]);
//
//   }
//   catch(e) {
//     console.log(e);
//     throw e;
//   }
// })
// it('Inserting batch - table 1', async () => {
//   try {
//     result = await r.db(dbName).table(tableName).insert(eval('['+new Array(numDocs).join('{}, ')+'{}]')).run();
//     assert.equal(result.inserted, numDocs);
//
//   }
//   catch(e) {
//     throw e;
//   }
// })
// it('Inserting batch - table 2', async () => {
//   try {
//     result = await r.db(dbName).table(tableName2).insert(eval('['+new Array(smallNumDocs).join('{}, ')+'{}]')).run();
//     assert.equal(result.inserted, smallNumDocs);
//
//   }
//   catch(e) {
//     throw e;
//   }
// })
// it('Inserting batch', async () => {
//   try {
//     // Add a date
//     result = await r.db(dbName).table(tableName).update({
//       date: r.now()
//     }).run();
//
//   }
//   catch(e) {
//     throw e;
//   }
// })
// it('`table` should return a stream', async () => {
//   try {
//     stream = await r.db(dbName).table(tableName).run({stream: true});
//     assert(stream);
//     assert(stream instanceof Readable);
//     stream.close();

//
//   }
//   catch(e) {
//     throw e;
//   }
// })
// it('Arrays should return a stream', async () => {
//   try {
//     let data = [10, 11, 12, 13, 14, 15, 16];
//     stream = await r.expr(data).run({stream: true});
//     assert(stream);
//     assert(stream instanceof Readable);

//     let count = 0;
//     stream.on('data', function() {
//       count++;
//       if (count === data.length) {
//
//       }
//     });
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('changes() should return a stream', async () => {
//   try {
//     let data = [{}, {}, {}, {}];
//     stream = await r.db(dbName).table(tableName).changes().run({stream: true});
//     assert(stream);
//     assert(stream instanceof Readable);

//     let count = 0;
//     stream.on('data', function() {
//       count++;
//       if (count === data.length) {
//
//         stream.close();
//       }
//     });
//     await r.db(dbName).table(tableName).insert(data).run();
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('get().changes() should return a stream', async () => {
//   try {
//     stream = await r.db(dbName).table(tableName).get(1).changes().run({stream: true});
//     assert(stream);
//     assert(stream instanceof Readable);

//     let count = 0;
//     stream.on('data', function() {
//       count++;
//       if (count === 3) {
//
//         stream.close();
//       }
//     });
//     await r.db(dbName).table(tableName).insert({id: 1}).run();
//     await r.db(dbName).table(tableName).get(1).update({update: 1}).run();
//     await r.db(dbName).table(tableName).get(1).update({update: 2}).run();
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('`table` should return a stream - testing empty SUCCESS_COMPLETE', async () => {
//   let i=0;
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).run(connection, {stream: true, maxBatchRows: 1});
//     assert(stream);
//     assert(stream instanceof Readable);
//     stream.close();
//
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Test flowing - event data', async () => {
//   let i=0;
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).run(connection, {stream: true, maxBatchRows: 1});
//     let count = 0;
//     stream.on('data', function() {
//       count++;
//       if (count === numDocs) {
//
//       }
//     });
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Test read', async () => {
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).run(connection, {stream: true, maxBatchRows: 1});
//     stream.once('readable', function() {
//       let doc = stream.read();
//       if (doc === null) {
//         throw new Error("stream.read() should not return null when readable was emitted");
//       }
//       let count = 1;
//       stream.on('data', function(data) {
//         count++;
//         if (count === numDocs) {
//
//         }
//       });
//     });
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Test flowing - event data', async () => {
//   let i=0;
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).run(connection, {stream: true, maxBatchRows: 1});
//     let count = 0;
//     stream.on('data', function() {
//       count++;
//       if (count === numDocs) {
//
//       }
//     });
//     stream.pause();
//     if (count > 0) {
//       throw new Error("The stream should have been paused");
//     }
//     stream.resume();
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Test read with null value', async () => {
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).limit(10).union([null]).union(r.db(dbName).table(tableName).limit(10)).run(connection, {stream: true, maxBatchRows: 1});
//     stream.once('readable', function() {
//       let count = 0;
//       stream.on('data', function(data) {
//         count++;
//         if (count === 20) {
//
//         }
//         else if (count > 20) {
//           throw new Error("Should not get null");
//         }
//       });
//     });
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Test read', async () => {
//   try {
//     let connection = await r.connect({host: config.host, port: config.port, authKey: config.authKey});
//     assert(connection);

//     stream = await r.db(dbName).table(tableName).run(connection, {stream: true, maxBatchRows: 1});
//     stream.once('readable', function() {
//       let doc = stream.read();
//       if (doc === null) {
//         throw new Error("stream.read() should not return null when readable was emitted");
//       }
//       stream.close().then(function() {
//
//       }).error(function(error) {
//         throw error;
//       });

//     });
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('Import with stream as default', async () => {
//   let r1 = require('../lib')({stream: true, host: config.host, port: config.port, authKey: config.authKey, buffer: config.buffer, max: config.max, discovery: false, silent: true});
//   let i=0;
//   try {
//     stream = await r1.db(dbName).table(tableName).run();
//     assert(stream instanceof Readable);
//
//   }
//   catch(e) {
//     throw e;
//   }
// })

// it('toStream', async () => {
//   try {
//     stream = r.db(dbName).table(tableName).toStream();
//     stream.once('readable', function() {
//       let doc = stream.read();
//       if (doc === null) {
//         throw new Error("stream.read() should not return null when readable was emitted");
//       }
//       let count = 1;
//       stream.on('data', function(data) {
//         count++;
//         if (count === numDocs) {
//
//         }
//       });
//     });
//   }
//   catch(e) {
//     throw e;
//   }

// })
// it('toStream - with grouped data', async () => {
//   try {
//     stream = r.db(dbName).table(tableName).group({index: 'id'}).toStream();
//     stream.once('readable', function() {
//       let doc = stream.read();
//       if (doc === null) {
//         throw new Error("stream.read() should not return null when readable was emitted");
//       }
//       let count = 1;
//       stream.on('data', function(data) {
//         count++;
//         if (count === numDocs) {
//
//         }
//       });
//     });
//   }
//   catch(e) {
//     throw e;
//   }

// })

// it('pipe should work with a writable stream - 200-200', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   r1.db(dbName).table(tableName).toStream({highWaterMark: 200})
//     .pipe(r1.db(dbName).table(dumpTable).toStream({writable: true, highWaterMark: 200}))
//     .on('finish', function() {
//       r.expr([
//         r1.db(dbName).table(tableName).count(),
//         r1.db(dbName).table(dumpTable).count()
//       ]).run().then(function(result) {
//         if (result[0] !== result[1]) {
//           throw new Error('All the data should have been streamed');
//         }
//         return r1.db(dbName).table(dumpTable).delete()
//       }).then(function() {
//         r1.getPool(0).drain();
//       }).then(function() {
//         setTimeout(done, 1000);
//         //
//       }).error(done);
//     });
// })
// it('pipe should work with a writable stream - 200-20', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   r1.db(dbName).table(tableName).toStream({highWaterMark: 200})
//     .pipe(r1.db(dbName).table(dumpTable).toStream({writable: true, highWaterMark: 20}))
//     .on('finish', function() {
//       r.expr([
//         r1.db(dbName).table(tableName).count(),
//         r1.db(dbName).table(dumpTable).count()
//       ]).run().then(function(result) {
//         if (result[0] !== result[1]) {
//           throw new Error('All the data should have been streamed');
//         }
//         return r1.db(dbName).table(dumpTable).delete()
//       }).then(function() {
//         r1.getPool(0).drain();
//
//       }).error(done);
//     });
// })
// it('pipe should work with a writable stream - 20-200', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   r1.db(dbName).table(tableName).toStream({highWaterMark: 20})
//     .pipe(r1.db(dbName).table(dumpTable).toStream({writable: true, highWaterMark: 200}))
//     .on('finish', function() {
//       r.expr([
//         r1.db(dbName).table(tableName).count(),
//         r1.db(dbName).table(dumpTable).count()
//       ]).run().then(function(result) {
//         if (result[0] !== result[1]) {
//           throw new Error('All the data should have been streamed');
//         }
//         return r1.db(dbName).table(dumpTable).delete()
//       }).then(function() {
//         r1.getPool(0).drain();
//
//       }).error(done);
//     });
// })
// it('pipe should work with a writable stream - 50-50', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   r1.db(dbName).table(tableName).toStream({highWaterMark: 50})
//     .pipe(r1.db(dbName).table(dumpTable).toStream({writable: true, highWaterMark: 50}))
//     .on('finish', function() {
//       r.expr([
//         r1.db(dbName).table(tableName).count(),
//         r1.db(dbName).table(dumpTable).count()
//       ]).run().then(function(result) {
//         if (result[0] !== result[1]) {
//           console.log(result);
//           throw new Error('All the data should have been streamed');
//         }
//         return r1.db(dbName).table(dumpTable).delete()
//       }).then(function() {
//         r1.getPool(0).drain();
//
//       }).error(function(err) {
//         console.log(err);
//         throw err;
//       });
//     });
// })
// it('toStream((writable: true}) should handle options', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   let stream = r1.db(dbName).table(dumpTable).toStream({writable: true, highWaterMark: 50, conflict: 'replace'});
//   stream.write({id: 1, foo: 1});
//   stream.write({id: 1, foo: 2});
//   stream.end({id: 1, foo: 3});
//   stream.on('finish', function() {
//     r1.db(dbName).table(dumpTable).count().then(function(result) {
//       assert.equal(result, 1);
//       return r1.db(dbName).table(dumpTable).get(1)
//     }).then(function(result) {
//       assert.deepEqual(result, {id: 1, foo: 3});
//       return r1.db(dbName).table(dumpTable).delete();
//     }).then(function(result) {
//       r1.getPool(0).drain();
//
//     }).error(done);
//   });
// })

// it('test pipe all streams', async () => {
//   // Create a transform stream that will convert data to a string
//   let stream = require('stream')
//   let addfoobar = new stream.Transform();
//   addfoobar._writableState.objectMode = true;
//   addfoobar._readableState.objectMode = true;
//   addfoobar._transform = function (data, encoding, done) {
//     data.transform = true;
//     this.push(data);
//
//   }
//   let addbuzzlol = new stream.Transform();
//   addbuzzlol._writableState.objectMode = true;
//   addbuzzlol._readableState.objectMode = true;
//   addbuzzlol._transform = function (data, encoding, done) {
//     delete data.id
//     data.written = true;
//     this.push(data);
//
//   }

//   r.db(dbName).table(tableName).without('id').toStream()
//     .on('error', done)
//     .pipe(addfoobar)
//     .on('error', done)
//     .pipe(r.db(dbName).table(dumpTable).toStream({transform: true}))
//     .on('error', done)
//     .pipe(addbuzzlol)
//     .on('error', done)
//     .pipe(r.db(dbName).table(dumpTable).toStream({writable: true}))
//     .on('error', done)
//     .on('finish', function() {
//       r.db(dbName).table(dumpTable).filter({written: true}).count().run().then(function(result) {
//         assert(result, numDocs);
//         return r.db(dbName).table(dumpTable).filter({transform:true}).count().run()
//       }).then(function() {
//         assert(result, numDocs*2);
//         return r.db(dbName).table(dumpTable).delete();
//       }).then(function(result) {
//
//         r.getPool(0).drain();
//       });
//     });
// })

// it('toStream({writable: true}) should throw on something else than a table', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   try {
//     r.expr(dumpTable).toStream({writable: true});
//   }
//   catch(err) {
//     assert(err.message, "Cannot create a writable stream on something else than a table.");
//
//   }
// })

// it('toStream({transform: true}) should throw on something else than a table', async () => {
//   let r1 = require('../lib')({buffer:1, max: 2, discovery: false, silent: true});

//   try {
//     r.expr(dumpTable).toStream({transform: true});
//   }
//   catch(err) {
//     assert(err.message, "Cannot create a writable stream on something else than a table.");
//
//   }
// })
