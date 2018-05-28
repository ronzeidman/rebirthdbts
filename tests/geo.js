import * as config from './config';
import { r } from '../src';
r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';

let dbName, tableName, result;
let numDocs = 10;

it('Init for `geo.js`', async () => {
  try {
    dbName = uuid();
    tableName = uuid();

    result = await r.dbCreate(dbName).run();
    assert.equal(result.dbs_created, 1);

    result = await r
      .db(dbName)
      .tableCreate(tableName)
      .run();
    assert.equal(result.tables_created, 1);

    result = await r
      .db(dbName)
      .table(tableName)
      .indexCreate('location', { geo: true })
      .run();
    result = await r
      .db(dbName)
      .table(tableName)
      .indexWait('location')
      .run();

    let insert_docs = [];
    for (let i = 0; i < numDocs; i++) {
      insert_docs.push({
        location: r.point(
          r.random(0, 1, { float: true }),
          r.random(0, 1, { float: true })
        )
      });
    }
    result = await r
      .db(dbName)
      .table(tableName)
      .insert(insert_docs)
      .run();
  } catch (e) {
    throw e;
  }
});

it('`r.circle` should work - 1', async () => {
  try {
    let result: any = await r.circle([0, 0], 2).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates[0].length, 33);
  } catch (e) {
    throw e;
  }
});
it('`r.circle` should work - 2', async () => {
  try {
    let result: any = await r.circle(r.point(0, 0), 2).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates[0].length, 33);

    let result: any = await r
      .circle(r.point(0, 0), 2, { numVertices: 40 })
      .run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates[0].length, 41);
  } catch (e) {
    throw e;
  }
});
it('`r.circle` should work - 3', async () => {
  try {
    let result: any = await r
      .circle(r.point(0, 0), 2, { numVertices: 40, fill: false })
      .run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'LineString');
    assert.equal(result.coordinates.length, 41);
  } catch (e) {
    throw e;
  }
});
it('`r.circle` should work - 4', async () => {
  try {
    let result: any = await r
      .circle(r.point(0, 0), 1, { unit: 'km' })
      .eq(r.circle(r.point(0, 0), 1000, { unit: 'm' }))
      .run();
    assert(result);
  } catch (e) {
    throw e;
  }
});

it('`r.circle` should throw with non recognized arguments', async () => {
  try {
    let result: any = await r.circle(r.point(0, 0), 1, { foo: 'bar' }).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (e.message.match(/^Unrecognized option `foo` in `circle`/) !== null) {
    } else {
      throw e;
    }
  }
});
it('`r.circle` arity - 1', async () => {
  try {
    let result: any = await r.circle(r.point(0, 0)).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.circle` takes at least 2 arguments, 1 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`r.circle` arity - 2', async () => {
  try {
    let result: any = await r.circle(0, 1, 2, 3, 4).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.circle` takes at most 3 arguments, 5 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`distance` should work - 1', async () => {
  try {
    let result: any = await r
      .point(0, 0)
      .distance(r.point(1, 1))
      .run();
    assert.equal(Math.floor(result), 156899);
  } catch (e) {
    throw e;
  }
});
it('`r.distance` should work - 1', async () => {
  try {
    let result: any = await r.distance(r.point(0, 0), r.point(1, 1)).run();
    assert.equal(Math.floor(result), 156899);
  } catch (e) {
    throw e;
  }
});

it('`distance` should work - 2', async () => {
  try {
    let result: any = await r
      .point(0, 0)
      .distance(r.point(1, 1), { unit: 'km' })
      .run();
    assert.equal(Math.floor(result), 156);
  } catch (e) {
    throw e;
  }
});

it('`distance` arity - 1', async () => {
  try {
    let result: any = await r
      .point(0, 0)
      .distance()
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`distance` takes at least 1 argument, 0 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`distance` arity - 2', async () => {
  try {
    let result: any = await r
      .point(0, 0)
      .distance(1, 2, 3)
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`distance` takes at most 2 arguments, 3 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});

it('`fill` should work', async () => {
  try {
    let result: any = await r
      .circle(r.point(0, 0), 2, { numVertices: 40, fill: false })
      .fill()
      .run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates[0].length, 41);
  } catch (e) {
    throw e;
  }
});
it('`fill` arity error', async () => {
  try {
    let result: any = await r
      .circle(r.point(0, 0), 2, { numVertices: 40, fill: false })
      .fill(1)
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (e.message.match(/^`fill` takes 0 arguments, 1 provided/) !== null) {
    } else {
      throw e;
    }
  }
});
it('`geojson` should work', async () => {
  try {
    let result: any = await r
      .geojson({ coordinates: [0, 0], type: 'Point' })
      .run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
  } catch (e) {
    throw e;
  }
});
it('`geojson` arity error', async () => {
  try {
    let result: any = await r.geojson(1, 2, 3).run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (e.message.match(/^`r.geojson` takes 1 argument, 3 provided/) !== null) {
    } else {
      throw e;
    }
  }
});
it('`toGeojson` should work', async () => {
  try {
    let result: any = await r
      .geojson({ coordinates: [0, 0], type: 'Point' })
      .toGeojson()
      .run();
    assert.equal(result.$reql_type$, undefined);
  } catch (e) {
    throw e;
  }
});
it('`toGeojson` arity error', async () => {
  try {
    let result: any = await r
      .point(0, 0)
      .toGeojson(1, 2, 3)
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`toGeojson` takes 0 arguments, 3 provided/) !== null
    ) {
    } else {
      throw e;
    }
  }
});

it('`getIntersecting` should work', async () => {
  try {
    // All points are in [0,1]x[0,1]
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getIntersecting(r.polygon([0, 0], [0, 1], [1, 1], [1, 0]), {
        index: 'location'
      })
      .count()
      .run();
    assert.equal(result, numDocs);
  } catch (e) {
    throw e;
  }
});
it('`getIntersecting` arity', async () => {
  try {
    // All points are in [0,1]x[0,1]
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getIntersecting(r.polygon([0, 0], [0, 1], [1, 1], [1, 0]))
      .count()
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`getIntersecting` takes 2 arguments, 1 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`getNearest` should work', async () => {
  try {
    // All points are in [0,1]x[0,1]
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getNearest(r.point(0, 0), { index: 'location', maxResults: 5 })
      .run();
    assert(result.length <= 5);
  } catch (e) {
    throw e;
  }
});

it('`getNearest` arity', async () => {
  try {
    let result: any = await r
      .db(dbName)
      .table(tableName)
      .getNearest(r.point(0, 0))
      .count()
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`getNearest` takes 2 arguments, 1 provided/) !== null
    ) {
    } else {
      throw e;
    }
  }
});

it('`includes` should work', async () => {
  try {
    let point1 = r.point(-117.220406, 32.719464);
    let point2 = r.point(-117.206201, 32.725186);
    let result: any = await r
      .circle(point1, 2000)
      .includes(point2)
      .run();
    assert(result);
  } catch (e) {
    throw e;
  }
});
it('`includes` arity', async () => {
  try {
    let result: any = await r
      .circle([0, 0], 2000)
      .includes()
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (e.message.match(/^`includes` takes 1 argument, 0 provided/) !== null) {
    } else {
      throw e;
    }
  }
});

it('`intersects` should work', async () => {
  try {
    let point1 = r.point(-117.220406, 32.719464);
    let point2 = r.point(-117.206201, 32.725186);
    r
      .circle(point1, 2000)
      .intersects(r.circle(point2, 2000))
      .run();
    assert(result);
  } catch (e) {
    throw e;
  }
});
it('`intersects` arity', async () => {
  try {
    // All points are in [0,1]x[0,1]
    let point1 = r.point(-117.220406, 32.719464);
    let point2 = r.point(-117.206201, 32.725186);
    r
      .circle(point1, 2000)
      .intersects(r.circle(point2, 2000), 2, 3)
      .run();

    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`intersects` takes 1 argument, 3 provided/) !== null
    ) {
    } else {
      throw e;
    }
  }
});

it('`r.line` should work - 1', async () => {
  try {
    let result: any = await r.line([0, 0], [1, 2]).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'LineString');
    assert.equal(result.coordinates[0].length, 2);
  } catch (e) {
    throw e;
  }
});
it('`r.line` should work - 2', async () => {
  try {
    let result: any = await r.line(r.point(0, 0), r.point(1, 2)).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'LineString');
    assert.equal(result.coordinates[0].length, 2);
  } catch (e) {
    throw e;
  }
});

it('`r.line` arity', async () => {
  try {
    let result: any = await r.line().run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.line` takes at least 2 arguments, 0 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});

it('`r.point` should work', async () => {
  try {
    let result: any = await r.point(0, 0).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Point');
    assert.equal(result.coordinates.length, 2);
  } catch (e) {
    throw e;
  }
});

it('`r.point` arity', async () => {
  try {
    let result: any = await r.point().run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (e.message.match(/^`r.point` takes 2 arguments, 0 provided/) !== null) {
    } else {
      throw e;
    }
  }
});

it('`r.polygon` should work', async () => {
  try {
    let result: any = await r.polygon([0, 0], [0, 1], [1, 1]).run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates[0].length, 4); // The server will close the line
  } catch (e) {
    throw e;
  }
});

it('`r.polygon` arity', async () => {
  try {
    let result: any = await r.polygon().run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`r.polygon` takes at least 3 arguments, 0 provided/) !==
      null
    ) {
    } else {
      throw e;
    }
  }
});
it('`polygonSub` should work', async () => {
  try {
    let result: any = await r
      .polygon([0, 0], [0, 1], [1, 1], [1, 0])
      .polygonSub(r.polygon([0.4, 0.4], [0.4, 0.5], [0.5, 0.5]))
      .run();
    assert.equal(result.$reql_type$, 'GEOMETRY');
    assert.equal(result.type, 'Polygon');
    assert.equal(result.coordinates.length, 2); // The server will close the line
  } catch (e) {
    throw e;
  }
});

it('`polygonSub` arity', async () => {
  try {
    let result: any = await r
      .polygon([0, 0], [0, 1], [1, 1])
      .polygonSub()
      .run();
    throw new Error('Was expecting an error');
  } catch (e) {
    if (
      e.message.match(/^`polygonSub` takes 1 argument, 0 provided/) !== null
    ) {
    } else {
      throw e;
    }
  }
});
