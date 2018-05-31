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
const baseConfig = __importStar(require("./config"));
const common_1 = require("./util/common");
const config = Object.assign({}, baseConfig, { pool: false, silent: true });
let connection; // global connection
let dbName;
let tableName;
let result;
it('Testing `run` without connection', async () => {
    try {
        await src_1.r.expr(1).run();
    }
    catch (e) {
        assert_1.default.equal(e.message, '`run` was called without a connection and no pool has been created after:\nr.expr(1)');
    }
});
it('Testing `run` with a closed connection', async () => {
    try {
        connection = await src_1.r.connect(config);
        assert_1.default(connection);
        connection.close();
        await src_1.r.expr(1).run(connection);
    }
    catch (e) {
        if (e.message ===
            '`run` was called with a closed connection after:\nr.expr(1)') {
            return;
        }
        else {
            throw e;
        }
    }
});
it('Init for `cursor.js`', async () => {
    try {
        connection = await src_1.r.connect(config);
        assert_1.default(connection);
        dbName = common_1.uuid();
        const tableName = common_1.uuid();
        let result = await src_1.r.dbCreate(dbName).run(connection);
        assert_1.default.equal(result.config_changes.length, 1);
        assert_1.default.equal(result.dbs_created, 1);
        result = await src_1.r
            .db(dbName)
            .tableCreate(tableName)
            .run(connection);
        assert_1.default.equal(result.tables_created, 1);
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .insert(eval('[' + new Array(100).join('{}, ') + '{}]'))
            .run(connection);
        assert_1.default.equal(result.inserted, 100);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`run` should use the default database', async () => {
    try {
        dbName = common_1.uuid();
        tableName = common_1.uuid();
        let result = await src_1.r.dbCreate(dbName).run(connection);
        assert_1.default.equal(result.dbs_created, 1);
        result = await src_1.r
            .db(dbName)
            .tableCreate(tableName)
            .run(connection);
        assert_1.default.equal(result.tables_created, 1);
        result = await connection.close();
        connection = await src_1.r.connect({
            pool: false,
            db: dbName,
            servers: [{ host: config.host, port: config.port }],
            password: config.authKey
        });
        assert_1.default(connection);
        result = await src_1.r.tableList().run(connection);
        assert_1.default.deepEqual(result, [tableName]);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`use` should work', async () => {
    try {
        dbName = common_1.uuid();
        tableName = common_1.uuid();
        let result = await src_1.r.dbCreate(dbName).run(connection);
        assert_1.default.equal(result.dbs_created, 1);
        result = await src_1.r
            .db(dbName)
            .tableCreate(tableName)
            .run(connection);
        assert_1.default.equal(result.tables_created, 1);
        connection.use(dbName);
        result = await src_1.r.tableList().run(connection);
        assert_1.default.deepEqual(result, [tableName]);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`reconnect` should work', async () => {
    try {
        let result = await src_1.r.expr(1).run(connection);
        assert_1.default.equal(result, 1);
        result = await connection.close();
        assert_1.default(connection);
        connection = await connection.reconnect();
        assert_1.default(connection);
        result = await src_1.r.tableList().run(connection);
        assert_1.default.deepEqual(result, [tableName]);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`reconnect` should work with options', async () => {
    try {
        let result = await src_1.r.expr(1).run(connection);
        assert_1.default.equal(result, 1);
        assert_1.default(connection);
        connection = await connection.reconnect({ noreplyWait: true });
        assert_1.default(connection);
        result = await src_1.r.expr(1).run(connection);
        assert_1.default.equal(result, 1);
        connection = await connection.reconnect({ noreplyWait: false });
        assert_1.default(connection);
        result = await src_1.r.expr(1).run(connection);
        assert_1.default.equal(result, 1);
        connection = await connection.reconnect();
        assert_1.default(connection);
        result = await src_1.r.expr(1).run(connection);
        assert_1.default.equal(result, 1);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`noreplyWait` should work', async () => {
    try {
        result = await connection.noreplyWait();
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`run` should take an argument', async () => {
    try {
        let result = await connection.close();
        assert_1.default(connection);
        connection = await src_1.r.connect(config);
        assert_1.default(connection);
        result = await src_1.r.expr(1).run(connection, { readMode: 'single' });
        assert_1.default.equal(result, 1);
        result = await src_1.r.expr(1).run(connection, { readMode: 'majority' });
        assert_1.default.equal(result, 1);
        result = await src_1.r.expr(1).run(connection, { profile: false });
        assert_1.default.equal(result, 1);
        result = await src_1.r.expr(1).run(connection, { profile: true });
        assert_1.default(result.profile);
        assert_1.default.equal(result.result, 1);
        result = await src_1.r.expr(1).run(connection, { durability: 'soft' });
        assert_1.default.equal(result, 1);
        result = await src_1.r.expr(1).run(connection, { durability: 'hard' });
        assert_1.default.equal(result, 1);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`run` should throw on an unrecognized argument', async () => {
    try {
        result = await src_1.r.expr(1).run(connection, { foo: 'bar' });
    }
    catch (e) {
        if (e.message === 'Unrecognized global optional argument `foo`.'
        // 'Unrecognized option `foo` in `run`. Available options are readMode <string>, durability <string>, noreply <bool>, timeFormat <string>, groupFormat: <string>, profile <bool>, binaryFormat <bool>, cursor <bool>, stream <bool>.'
        ) {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`r()` should be a shortcut for r.expr()', async () => {
    try {
        result = await src_1.r(1).run(connection);
        assert_1.default.deepEqual(result, 1);
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`timeFormat` should work', async () => {
    try {
        result = await src_1.r.now().run(connection);
        assert_1.default(result instanceof Date);
        result = await src_1.r.now().run(connection, { timeFormat: 'native' });
        assert_1.default(result instanceof Date);
        result = await src_1.r.now().run(connection, { timeFormat: 'raw' });
        assert_1.default.equal(result.$reql_type$, 'TIME');
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`binaryFormat` should work', async () => {
    try {
        result = await src_1.r
            .binary(new Buffer([1, 2, 3]))
            .run(connection, { binaryFormat: 'raw' });
        assert_1.default.equal(result.$reql_type$, 'BINARY');
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`groupFormat` should work', async () => {
    try {
        let result = await src_1.r
            .expr([
            { name: 'Michel', grownUp: true },
            { name: 'Laurent', grownUp: true },
            { name: 'Sophie', grownUp: true },
            { name: 'Luke', grownUp: false },
            { name: 'Mino', grownUp: false }
        ])
            .group('grownUp')
            .run(connection, { groupFormat: 'raw' });
        assert_1.default.deepEqual(result, {
            $reql_type$: 'GROUPED_DATA',
            data: [
                [
                    false,
                    [{ grownUp: false, name: 'Luke' }, { grownUp: false, name: 'Mino' }]
                ],
                [
                    true,
                    [
                        { grownUp: true, name: 'Michel' },
                        { grownUp: true, name: 'Laurent' },
                        { grownUp: true, name: 'Sophie' }
                    ]
                ]
            ]
        });
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`profile` should work', async () => {
    try {
        result = await src_1.r.expr(true).run(connection, { profile: false });
        assert_1.default(result);
        result = await src_1.r.expr(true).run(connection, { profile: true });
        assert_1.default(result.profile);
        assert_1.default.equal(result.result, true);
        result = await src_1.r.expr(true).run(connection, { profile: false });
        assert_1.default.equal(result, true);
        return;
    }
    catch (e) { }
});
it('Test error message when running a query on a closed connection', async () => {
    try {
        await connection.close();
        await src_1.r.expr(1).run(connection);
    }
    catch (e) {
        if (e.message.match('`run` was called with a closed connection after:')) {
            return;
        }
        else {
            throw e;
        }
    }
});
it('Test timeout', async () => {
    let server;
    let port = 0;
    try {
        port = Math.floor(Math.random() * (65535 - 1025) + 1025);
        server = require('net')
            .createServer(function () { })
            .listen(port);
        connection = await src_1.r.connect({
            pool: false,
            servers: [{ host: 'localhost', port }],
            timeout: 1
        });
        throw new Error('Was expecting an error');
    }
    catch (err) {
        // close server
        if (err.message ===
            'Failed to connect to localhost:' + port + ' in less than 1s.') {
            return;
        }
        else {
            throw err;
        }
    }
});
it('`server` should work', async () => {
    try {
        connection = await src_1.r.connect(config);
        const response = await connection.server();
        assert_1.default(typeof response.name === 'string');
        assert_1.default(typeof response.id === 'string');
        return;
    }
    catch (e) {
        throw e;
    }
});
it('`grant` should work', async () => {
    try {
        connection = await src_1.r.connect(config);
        assert_1.default(connection);
        const restrictedDbName = common_1.uuid();
        const restrictedTableName = common_1.uuid();
        result = await src_1.r.dbCreate(restrictedDbName).run(connection);
        assert_1.default.equal(result.config_changes.length, 1);
        assert_1.default.equal(result.dbs_created, 1);
        result = await src_1.r
            .db(restrictedDbName)
            .tableCreate(restrictedTableName)
            .run(connection);
        assert_1.default.equal(result.tables_created, 1);
        const user = common_1.uuid();
        const password = common_1.uuid();
        result = await src_1.r
            .db('rethinkdb')
            .table('users')
            .insert({
            id: user,
            password: password
        })
            .run(connection);
        result = await src_1.r
            .db(restrictedDbName)
            .table(restrictedTableName)
            .grant(user, {
            read: true,
            write: true,
            config: true
        })
            .run(connection);
        assert_1.default.deepEqual(result, {
            granted: 1,
            permissions_changes: [
                {
                    new_val: {
                        config: true,
                        read: true,
                        write: true
                    },
                    old_val: null
                }
            ]
        });
        return;
    }
    catch (e) {
        throw e;
    }
});
it('If `servers` is specified, it cannot be empty', async () => {
    try {
        await src_1.r.connect({
            servers: []
        });
    }
    catch (e) {
        assert_1.default.equal(e.message, 'If `servers` is an array, it must contain at least one server.');
        return;
    }
});
