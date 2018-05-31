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
it('Init for `aggregation.js`', async () => {
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
    }
    catch (e) {
        throw e;
    }
});
it('`reduce` should work -- no base ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .reduce(function (left, right) {
            return left.add(right);
        })
            .run();
        assert_1.default.equal(result, 6);
    }
    catch (e) {
        throw e;
    }
});
it('`reduce` should throw if no argument has been passed', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .reduce()
            .run();
    }
    catch (e) {
        if (e.message ===
            '`reduce` takes 1 argument, 0 provided after:\nr.db("' +
                dbName +
                '").table("' +
                tableName +
                '")') {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`fold` should work', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .fold(10, function (left, right) {
            return left.add(right);
        })
            .run();
        assert_1.default.equal(result, 16);
    }
    catch (e) {
        throw e;
    }
});
it('`fold` should work -- with emit', async () => {
    try {
        result = await src_1.r
            .expr(['foo', 'bar', 'buzz', 'hello', 'world'])
            .fold(0, function (acc, row) {
            return acc.add(1);
        }, {
            emit: function (oldAcc, element, newAcc) {
                return [oldAcc, element, newAcc];
            }
        })
            .run();
        assert_1.default.deepEqual(result, [
            0,
            'foo',
            1,
            1,
            'bar',
            2,
            2,
            'buzz',
            3,
            3,
            'hello',
            4,
            4,
            'world',
            5
        ]);
    }
    catch (e) {
        throw e;
    }
});
it('`fold` should work -- with emit and finalEmit', async () => {
    try {
        result = await src_1.r
            .expr(['foo', 'bar', 'buzz', 'hello', 'world'])
            .fold(0, function (acc, row) {
            return acc.add(1);
        }, {
            emit: function (oldAcc, element, newAcc) {
                return [oldAcc, element, newAcc];
            },
            finalEmit: function (acc) {
                return [acc];
            }
        })
            .run();
        assert_1.default.deepEqual(result, [
            0,
            'foo',
            1,
            1,
            'bar',
            2,
            2,
            'buzz',
            3,
            3,
            'hello',
            4,
            4,
            'world',
            5,
            5
        ]);
    }
    catch (e) {
        throw e;
    }
});
it('`count` should work -- no arg ', async () => {
    try {
        result = await src_1.r
            .expr([0, 1, 2, 3, 4, 5])
            .count()
            .run();
        assert_1.default.equal(result, 6);
    }
    catch (e) {
        throw e;
    }
});
it('`count` should work -- filter ', async () => {
    try {
        result = await src_1.r
            .expr([0, 1, 2, 3, 4, 5])
            .count(row => row.eq(2))
            .run();
        assert_1.default.equal(result, 1);
        result = await src_1.r
            .expr([0, 1, 2, 3, 4, 5])
            .count(function (doc) {
            return doc.eq(2);
        })
            .run();
        assert_1.default.equal(result, 1);
    }
    catch (e) {
        throw e;
    }
});
it('`group` should work ', async () => {
    try {
        result = await src_1.r
            .expr([
            { name: 'Michel', grownUp: true },
            { name: 'Laurent', grownUp: true },
            { name: 'Sophie', grownUp: true },
            { name: 'Luke', grownUp: false },
            { name: 'Mino', grownUp: false }
        ])
            .group('grownUp')
            .run();
        result.sort();
        assert_1.default.deepEqual(result, [
            {
                group: false,
                reduction: [
                    { grownUp: false, name: 'Luke' },
                    { grownUp: false, name: 'Mino' }
                ]
            },
            {
                group: true,
                reduction: [
                    { grownUp: true, name: 'Michel' },
                    { grownUp: true, name: 'Laurent' },
                    { grownUp: true, name: 'Sophie' }
                ]
            }
        ]);
    }
    catch (e) {
        throw e;
    }
});
it('`group` should work with row => row', async () => {
    try {
        result = await src_1.r
            .expr([
            { name: 'Michel', grownUp: true },
            { name: 'Laurent', grownUp: true },
            { name: 'Sophie', grownUp: true },
            { name: 'Luke', grownUp: false },
            { name: 'Mino', grownUp: false }
        ])
            .group(row => row('grownUp'))
            .run();
        result.sort();
        assert_1.default.deepEqual(result, [
            {
                group: false,
                reduction: [
                    { grownUp: false, name: 'Luke' },
                    { grownUp: false, name: 'Mino' }
                ]
            },
            {
                group: true,
                reduction: [
                    { grownUp: true, name: 'Michel' },
                    { grownUp: true, name: 'Laurent' },
                    { grownUp: true, name: 'Sophie' }
                ]
            }
        ]);
    }
    catch (e) {
        throw e;
    }
});
it('`group` should work with an index ', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .insert([
            { id: 1, group: 1 },
            { id: 2, group: 1 },
            { id: 3, group: 1 },
            { id: 4, group: 4 }
        ])
            .run();
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .indexCreate('group')
            .run();
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .indexWait('group')
            .run();
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .group({ index: 'group' })
            .run();
        assert_1.default.equal(result.length, 2);
        assert_1.default(result[0].reduction.length === 3 || result[0].reduction.length === 1);
        assert_1.default(result[1].reduction.length === 3 || result[1].reduction.length === 1);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
it('`groupFormat` should work -- with raw', async () => {
    try {
        result = await src_1.r
            .expr([
            { name: 'Michel', grownUp: true },
            { name: 'Laurent', grownUp: true },
            { name: 'Sophie', grownUp: true },
            { name: 'Luke', grownUp: false },
            { name: 'Mino', grownUp: false }
        ])
            .group('grownUp')
            .run({ groupFormat: 'raw' });
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
    }
    catch (e) {
        throw e;
    }
});
it('`group` results should be properly parsed ', async () => {
    try {
        result = await src_1.r
            .expr([
            { name: 'Michel', date: src_1.r.now() },
            { name: 'Laurent', date: src_1.r.now() },
            { name: 'Sophie', date: src_1.r.now().sub(1000) }
        ])
            .group('date')
            .run();
        assert_1.default.equal(result.length, 2);
        assert_1.default(result[0].group instanceof Date);
        assert_1.default(result[0].reduction[0].date instanceof Date);
    }
    catch (e) {
        throw e;
    }
});
it('`ungroup` should work ', async () => {
    try {
        result = await src_1.r
            .expr([
            { name: 'Michel', grownUp: true },
            { name: 'Laurent', grownUp: true },
            { name: 'Sophie', grownUp: true },
            { name: 'Luke', grownUp: false },
            { name: 'Mino', grownUp: false }
        ])
            .group('grownUp')
            .ungroup()
            .run();
        result.sort();
        assert_1.default.deepEqual(result, [
            {
                group: false,
                reduction: [
                    { grownUp: false, name: 'Luke' },
                    { grownUp: false, name: 'Mino' }
                ]
            },
            {
                group: true,
                reduction: [
                    { grownUp: true, name: 'Michel' },
                    { grownUp: true, name: 'Laurent' },
                    { grownUp: true, name: 'Sophie' }
                ]
            }
        ]);
    }
    catch (e) {
        throw e;
    }
});
it('`contains` should work ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(2)
            .run();
        assert_1.default.equal(result, true);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(1, 2)
            .run();
        assert_1.default.equal(result, true);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(1, 5)
            .run();
        assert_1.default.equal(result, false);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(function (doc) {
            return doc.eq(1);
        })
            .run();
        assert_1.default.equal(result, true);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(row => row.eq(1))
            .run();
        assert_1.default.equal(result, true);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(row => row.eq(1), row => row.eq(2))
            .run();
        assert_1.default.equal(result, true);
        result = await src_1.r
            .expr([1, 2, 3])
            .contains(row => row.eq(1), row => row.eq(5))
            .run();
        assert_1.default.equal(result, false);
    }
    catch (e) {
        throw e;
    }
});
it('`contains` should throw if called without arguments', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .contains()
            .run();
    }
    catch (e) {
        if (e.message ===
            '`contains` takes at least 1 argument, 0 provided after:\nr.db("' +
                dbName +
                '").table("' +
                tableName +
                '")') {
            return;
        }
        else {
            throw e;
        }
    }
});
it('`sum` should work ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .sum()
            .run();
        assert_1.default.equal(result, 6);
    }
    catch (e) {
        throw e;
    }
});
it('`sum` should work with a field', async () => {
    try {
        result = await src_1.r
            .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
            .sum('a')
            .run();
        assert_1.default.deepEqual(result, 21);
    }
    catch (e) {
        throw e;
    }
});
it('`avg` should work ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .avg()
            .run();
        assert_1.default.equal(result, 2);
    }
    catch (e) {
        throw e;
    }
});
it('`r.avg` should work ', async () => {
    try {
        result = await src_1.r.avg([1, 2, 3]).run();
        assert_1.default.equal(result, 2);
    }
    catch (e) {
        throw e;
    }
});
it('`avg` should work with a field', async () => {
    try {
        result = await src_1.r
            .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
            .avg('a')
            .run();
        assert_1.default.equal(result, 7);
    }
    catch (e) {
        throw e;
    }
});
it('`r.avg` should work with a field', async () => {
    try {
        result = await src_1.r.avg([{ a: 2 }, { a: 10 }, { a: 9 }], 'a').run();
        assert_1.default.equal(result, 7);
    }
    catch (e) {
        throw e;
    }
});
it('`min` should work ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .min()
            .run();
        assert_1.default.equal(result, 1);
    }
    catch (e) {
        throw e;
    }
});
it('`r.min` should work ', async () => {
    try {
        result = await src_1.r.min([1, 2, 3]).run();
        assert_1.default.equal(result, 1);
    }
    catch (e) {
        throw e;
    }
});
it('`min` should work with a field', async () => {
    try {
        result = await src_1.r
            .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
            .min('a')
            .run();
        assert_1.default.deepEqual(result, { a: 2 });
    }
    catch (e) {
        throw e;
    }
});
it('`r.min` should work with a field', async () => {
    try {
        result = await src_1.r.min([{ a: 2 }, { a: 10 }, { a: 9 }], 'a').run();
        assert_1.default.deepEqual(result, { a: 2 });
    }
    catch (e) {
        throw e;
    }
});
it('`max` should work ', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3])
            .max()
            .run();
        assert_1.default.equal(result, 3);
    }
    catch (e) {
        throw e;
    }
});
it('`r.max` should work ', async () => {
    try {
        result = await src_1.r.max([1, 2, 3]).run();
        assert_1.default.equal(result, 3);
    }
    catch (e) {
        throw e;
    }
});
it('`distinct` should work', async () => {
    try {
        result = await src_1.r
            .expr([1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 4])
            .distinct()
            .orderBy(row => row)
            .run();
        assert_1.default.deepEqual(result, [1, 2, 3, 4]);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
it('`r.distinct` should work', async () => {
    try {
        result = await src_1.r
            .distinct([1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 4])
            .orderBy(row => row)
            .run();
        assert_1.default.deepEqual(result, [1, 2, 3, 4]);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
it('`distinct` should work with an index', async () => {
    try {
        result = await src_1.r
            .db(dbName)
            .table(tableName)
            .distinct({ index: 'id' })
            .count()
            .run();
        let result2 = await src_1.r
            .db(dbName)
            .table(tableName)
            .count()
            .run();
        assert_1.default.equal(result, result2);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
});
