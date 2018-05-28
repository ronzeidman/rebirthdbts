//tslint:disable
import assert from 'assert';
import { r } from '../src';
import * as config from './config';
import { uuid } from './util/common';

let dbName: string;
let tableName: string;
let result: any;

it('Init for `aggregation.js`', async () => {
  try {
    await r.connect(config);
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);
  } catch (e) {
    throw e;
  }
});

it('`reduce` should work -- no base ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .reduce(function(left, right) {
        return left.add(right);
      })
      .run();
    assert.equal(result, 6);
  } catch (e) {
    throw e;
  }
});
it('`reduce` should throw if no argument has been passed', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .reduce()
      .run();
  } catch (e) {
    if (
      e.message ===
      '`reduce` takes 1 argument, 0 provided after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('`fold` should work', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .fold(10, function(left, right) {
        return left.add(right);
      })
      .run();
    assert.equal(result, 16);
  } catch (e) {
    throw e;
  }
});
it('`fold` should work -- with emit', async () => {
  try {
    result = await r
      .expr(['foo', 'bar', 'buzz', 'hello', 'world'])
      .fold(
        0,
        function(acc, row) {
          return acc.add(1);
        },
        {
          emit: function(oldAcc, element, newAcc) {
            return [oldAcc, element, newAcc];
          }
        }
      )
      .run();
    assert.deepEqual(result, [
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
  } catch (e) {
    throw e;
  }
});
it('`fold` should work -- with emit and finalEmit', async () => {
  try {
    result = await r
      .expr(['foo', 'bar', 'buzz', 'hello', 'world'])
      .fold(
        0,
        function(acc, row) {
          return acc.add(1);
        },
        {
          emit: function(oldAcc, element, newAcc) {
            return [oldAcc, element, newAcc];
          },
          finalEmit: function(acc) {
            return [acc];
          }
        }
      )
      .run();
    assert.deepEqual(result, [
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
  } catch (e) {
    throw e;
  }
});

it('`count` should work -- no arg ', async () => {
  try {
    result = await r
      .expr([0, 1, 2, 3, 4, 5])
      .count()
      .run();
    assert.equal(result, 6);
  } catch (e) {
    throw e;
  }
});
it('`count` should work -- filter ', async () => {
  try {
    result = await r
      .expr([0, 1, 2, 3, 4, 5])
      .count(row => row.eq(2))
      .run();
    assert.equal(result, 1);

    result = await r
      .expr([0, 1, 2, 3, 4, 5])
      .count(function(doc) {
        return doc.eq(2);
      })
      .run();
    assert.equal(result, 1);
  } catch (e) {
    throw e;
  }
});
it('`group` should work ', async () => {
  try {
    result = await r
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

    assert.deepEqual(result, [
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
  } catch (e) {
    throw e;
  }
});
it('`group` should work with row => row', async () => {
  try {
    result = await r
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

    assert.deepEqual(result, [
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
  } catch (e) {
    throw e;
  }
});
it('`group` should work with an index ', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .insert([
        { id: 1, group: 1 },
        { id: 2, group: 1 },
        { id: 3, group: 1 },
        { id: 4, group: 4 }
      ])
      .run();
    result = await r
      .db(dbName)
      .table(tableName)
      .indexCreate('group')
      .run();
    result = await r
      .db(dbName)
      .table(tableName)
      .indexWait('group')
      .run();
    result = await r
      .db(dbName)
      .table(tableName)
      .group({ index: 'group' })
      .run();

    assert.equal(result.length, 2);
    assert(
      result[0].reduction.length === 3 || result[0].reduction.length === 1
    );
    assert(
      result[1].reduction.length === 3 || result[1].reduction.length === 1
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
});

it('`groupFormat` should work -- with raw', async () => {
  try {
    result = await r
      .expr([
        { name: 'Michel', grownUp: true },
        { name: 'Laurent', grownUp: true },
        { name: 'Sophie', grownUp: true },
        { name: 'Luke', grownUp: false },
        { name: 'Mino', grownUp: false }
      ])
      .group('grownUp')
      .run({ groupFormat: 'raw' });

    assert.deepEqual(result, {
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
  } catch (e) {
    throw e;
  }
});

it('`group` results should be properly parsed ', async () => {
  try {
    result = await r
      .expr([
        { name: 'Michel', date: r.now() },
        { name: 'Laurent', date: r.now() },
        { name: 'Sophie', date: r.now().sub(1000) }
      ])
      .group('date')
      .run();
    assert.equal(result.length, 2);
    assert(result[0].group instanceof Date);
    assert(result[0].reduction[0].date instanceof Date);
  } catch (e) {
    throw e;
  }
});

it('`ungroup` should work ', async () => {
  try {
    result = await r
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

    assert.deepEqual(result, [
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
  } catch (e) {
    throw e;
  }
});

it('`contains` should work ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .contains(2)
      .run();
    assert.equal(result, true);

    result = await r
      .expr([1, 2, 3])
      .contains(1, 2)
      .run();
    assert.equal(result, true);

    result = await r
      .expr([1, 2, 3])
      .contains(1, 5)
      .run();
    assert.equal(result, false);

    result = await r
      .expr([1, 2, 3])
      .contains(function(doc) {
        return doc.eq(1);
      })
      .run();
    assert.equal(result, true);

    result = await r
      .expr([1, 2, 3])
      .contains(row => row.eq(1))
      .run();
    assert.equal(result, true);

    result = await r
      .expr([1, 2, 3])
      .contains(row => row.eq(1), row => row.eq(2))
      .run();
    assert.equal(result, true);

    result = await r
      .expr([1, 2, 3])
      .contains(row => row.eq(1), row => row.eq(5))
      .run();
    assert.equal(result, false);
  } catch (e) {
    throw e;
  }
});
it('`contains` should throw if called without arguments', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .contains()
      .run();
  } catch (e) {
    if (
      e.message ===
      '`contains` takes at least 1 argument, 0 provided after:\nr.db("' +
        dbName +
        '").table("' +
        tableName +
        '")'
    ) {
      return;
    } else {
      throw e;
    }
  }
});

it('`sum` should work ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .sum()
      .run();
    assert.equal(result, 6);
  } catch (e) {
    throw e;
  }
});

it('`sum` should work with a field', async () => {
  try {
    result = await r
      .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
      .sum('a')
      .run();
    assert.deepEqual(result, 21);
  } catch (e) {
    throw e;
  }
});

it('`avg` should work ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .avg()
      .run();
    assert.equal(result, 2);
  } catch (e) {
    throw e;
  }
});
it('`r.avg` should work ', async () => {
  try {
    result = await r.avg([1, 2, 3]).run();
    assert.equal(result, 2);
  } catch (e) {
    throw e;
  }
});

it('`avg` should work with a field', async () => {
  try {
    result = await r
      .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
      .avg('a')
      .run();
    assert.equal(result, 7);
  } catch (e) {
    throw e;
  }
});
it('`r.avg` should work with a field', async () => {
  try {
    result = await r.avg([{ a: 2 }, { a: 10 }, { a: 9 }], 'a').run();
    assert.equal(result, 7);
  } catch (e) {
    throw e;
  }
});

it('`min` should work ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .min()
      .run();
    assert.equal(result, 1);
  } catch (e) {
    throw e;
  }
});
it('`r.min` should work ', async () => {
  try {
    result = await r.min([1, 2, 3]).run();
    assert.equal(result, 1);
  } catch (e) {
    throw e;
  }
});

it('`min` should work with a field', async () => {
  try {
    result = await r
      .expr([{ a: 2 }, { a: 10 }, { a: 9 }])
      .min('a')
      .run();
    assert.deepEqual(result, { a: 2 });
  } catch (e) {
    throw e;
  }
});
it('`r.min` should work with a field', async () => {
  try {
    result = await r.min([{ a: 2 }, { a: 10 }, { a: 9 }], 'a').run();
    assert.deepEqual(result, { a: 2 });
  } catch (e) {
    throw e;
  }
});

it('`max` should work ', async () => {
  try {
    result = await r
      .expr([1, 2, 3])
      .max()
      .run();
    assert.equal(result, 3);
  } catch (e) {
    throw e;
  }
});
it('`r.max` should work ', async () => {
  try {
    result = await r.max([1, 2, 3]).run();
    assert.equal(result, 3);
  } catch (e) {
    throw e;
  }
});

it('`distinct` should work', async () => {
  try {
    result = await r
      .expr([1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 4])
      .distinct()
      .orderBy(row => row)
      .run();
    assert.deepEqual(result, [1, 2, 3, 4]);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
it('`r.distinct` should work', async () => {
  try {
    result = await r
      .distinct([1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 4])
      .orderBy(row => row)
      .run();
    assert.deepEqual(result, [1, 2, 3, 4]);
  } catch (e) {
    console.log(e);
    throw e;
  }
});

it('`distinct` should work with an index', async () => {
  try {
    result = await r
      .db(dbName)
      .table(tableName)
      .distinct({ index: 'id' })
      .count()
      .run();
    let result2 = await r
      .db(dbName)
      .table(tableName)
      .count()
      .run();
    assert.equal(result, result2);
  } catch (e) {
    console.log(e);
    throw e;
  }
});
