"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//tslint:disable
const assert_1 = __importDefault(require("assert"));
const src_1 = require("../src");
const config = __importStar(require("./config"));
const common_1 = require("./util/common");
let dbName;
let tableName;
let result;
let pks;
it('Init for `administration.js`', async () => {
    try {
        await src_1.r.connect(config);
        dbName = common_1.uuid();
        tableName = common_1.uuid();
        result = await src_1.r.dbCreate(dbName).run();
        assert_1.default.equal(result.dbs_created, 1);
        result = await src_1.r
            .db(dbName)
            .tableCreate(tableName)
            .run();
        assert_1.default.equal(result.tables_created, 1);
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .insert(eval('[' + new Array(100).join('{}, ') + '{}]'))
            .run();
        assert_1.default.equal(result.inserted, 100);
        pks = result.generated_keys;
    }
    catch (e) {
        throw e;
    }
});
it('`config` should work', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .config()
            .run();
        assert_1.default.equal(result.name, dbName);
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .config()
            .run();
        assert_1.default.equal(result.name, tableName);
    }
    catch (e) {
        throw e;
    }
});
it('`config` should throw if called with an argument', async () => {
    try {
        let result = await src_1.r
            .db(dbName)
            .config('hello')
            .run();
    }
    catch (e) {
        if (e.message.match(/^`config` takes 0 arguments, 1 provided after:/)) {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`status` should work', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .status()
            .run();
        assert_1.default.equal(result.name, tableName);
        assert_1.default.notEqual(result.status, undefined);
    }
    catch (e) {
        throw e;
    }
});
it('`status` should throw if called with an argument', async () => {
    try {
        let result = await src_1.r
            .db(dbName)
            .table(tableName)
            .status('hello')
            .run();
    }
    catch (e) {
        if (e.message.match(/^`status` takes 0 arguments, 1 provided after:/)) {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`wait` should work', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .wait()
            .run();
        assert_1.default.equal(result.ready, 1);
        await src_1.r
            .db(dbName)
            .table(tableName)
            .wait({ waitFor: 'ready_for_writes', timeout: 2000 })
            .run();
    }
    catch (e) {
        throw e;
    }
});
it('`wait` should work with options', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .wait({ waitFor: 'ready_for_writes' })
            .run();
        assert_1.default.equal(result.ready, 1);
    }
    catch (e) {
        throw e;
    }
});
it('`r.wait` should throw', async () => {
    try {
        result = await src_1.r.wait().run();
        throw new Error('r.wait is expected to throw');
    }
    catch (e) {
        if (e.message.match(/^`wait` can only be called on a table or a database since 2.3./)) {
        }
        else {
            throw e;
        }
    }
});
it('`wait` should throw if called with 2 arguments', async () => {
    try {
        let result = await src_1.r
            .db(dbName)
            .table(tableName)
            .wait('hello', 'world')
            .run();
    }
    catch (e) {
        if (e.message.match(/^`wait` takes at most 1 argument, 2 provided after:/)) {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`reconfigure` should work - 1', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .reconfigure({ shards: 1, replicas: 1 })
            .run();
        assert_1.default.equal(result.reconfigured, 1);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
it('`reconfigure` should work - 2 - dryRun', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .reconfigure({ shards: 1, replicas: 1, dryRun: true })
            .run();
        assert_1.default.equal(result.reconfigured, 0);
    }
    catch (e) {
        throw e;
    }
});
it('`r.reconfigure` should throw', async () => {
    try {
        result = await src_1.r.reconfigure().run();
        throw new Error('r.reconfigure is expected to throw');
    }
    catch (e) {
        if (e.message.match(/^`reconfigure` can only be called on a table or a database since 2.3./)) {
        }
        else {
            throw e;
        }
    }
});
it('`reconfigure` should throw on an unrecognized key', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .reconfigure({ foo: 1 })
            .run();
        assert_1.default.equal(result.reconfigured, 0);
    }
    catch (e) {
        if (e.message.match(/^Unrecognized option `foo` in `reconfigure` after:/)) {
        }
        else {
            throw e;
        }
    }
});
it('`reconfigure` should throw on a number', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .reconfigure(1)
            .run();
    }
    catch (e) {
        if (e.message.match(/^First argument of `reconfigure` must be an object./)) {
        }
        else {
            throw e;
        }
    }
});
it('`rebalanced` should work - 1', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .rebalance()
            .run();
        assert_1.default.equal(result.rebalanced, 1);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
it('`r.rebalance` should throw', async () => {
    try {
        result = await src_1.r.rebalance().run();
        throw new Error('r.rebalance is expected to throw');
    }
    catch (e) {
        if (e.message.match(/^`rebalance` can only be called on a table or a database since 2.3./)) {
        }
        else {
            throw e;
        }
    }
});
it('`rebalance` should throw if an argument is provided', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .rebalance(1)
            .run();
    }
    catch (e) {
        if (e.message.match(/^`rebalance` takes 0 arguments, 1 provided after:/)) {
        }
        else {
            throw e;
        }
    }
});
