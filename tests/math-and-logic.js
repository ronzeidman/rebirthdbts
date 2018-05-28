import * as config from './config';
import { r } from '../src'; r.connect(config);
import { uuid } from './util/common';
import assert from 'assert';





let dbName, tableName, result;

it('`add` should work', async () => {
  try {
    result = await r.expr(1).add(1).run();
    assert.equal(result, 2);

    result = await r.expr(1).add(1).add(1).run();
    assert.equal(result, 3);

    result = await r.expr(1).add(1, 1).run();
    assert.equal(result, 3);

    result = await r.add(1, 1, 1).run();
    assert.equal(result, 3);


  }
  catch(e) {
    throw e;
  }
})
it('`add` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).add().run();
  }
  catch(e) {
    if (e.message === "`add` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})

it('`add` should throw if no argument has been passed -- r.add', async () => {
  try {
    let result: any = await r.add().run();
  }
  catch(e) {
    if (e.message === "`r.add` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`add` should throw if just one argument has been passed -- r.add', async () => {
  try {
    let result: any = await r.add(1).run();
  }
  catch(e) {
    if (e.message === "`r.add` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})

it('`sub` should work', async () => {
  try {
    let result: any = await r.expr(1).sub(1).run();
    assert.equal(result, 0);

    result = await r.sub(5, 3, 1).run();
    assert.equal(result, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`sub` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).sub().run();
  }
  catch(e) {
    if (e.message === "`sub` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`sub` should throw if no argument has been passed -- r.sub', async () => {
  try {
    let result: any = await r.sub().run();
  }
  catch(e) {
    if (e.message === "`r.sub` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`sub` should throw if just one argument has been passed -- r.sub', async () => {
  try {
    let result: any = await r.sub(1).run();
  }
  catch(e) {
    if (e.message === "`r.sub` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`mul` should work', async () => {
  try {
    let result: any = await r.expr(2).mul(3).run();
    assert.equal(result, 6);

    result = await r.mul(2, 3, 4).run();
    assert.equal(result, 24);


  }
  catch(e) {
    throw e;
  }
})
it('`mul` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).mul().run();
  }
  catch(e) {
    if (e.message === "`mul` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`mul` should throw if no argument has been passed -- r.mul', async () => {
  try {
    let result: any = await r.mul().run();
  }
  catch(e) {
    if (e.message === "`r.mul` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`mul` should throw if just one argument has been passed -- r.mul', async () => {
  try {
    let result: any = await r.mul(1).run();
  }
  catch(e) {
    if (e.message === "`r.mul` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`div` should work', async () => {
  try {
    let result: any = await r.expr(24).div(2).run();
    assert.equal(result, 12);

    result = await r.div(20, 2, 5, 1).run();
    assert.equal(result, 2);


  }
  catch(e) {
    throw e;
  }
})
it('`div` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).div().run();
  }
  catch(e) {
    if (e.message === "`div` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`div` should throw if no argument has been passed -- r.div', async () => {
  try {
    let result: any = await r.div().run();
  }
  catch(e) {
    if (e.message === "`r.div` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`div` should throw if just one argument has been passed -- r.div', async () => {
  try {
    let result: any = await r.div(1).run();
  }
  catch(e) {
    if (e.message === "`r.div` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`mod` should work', async () => {
  try {
    let result: any = await r.expr(24).mod(7).run();
    assert.equal(result, 3);

    result = await r.mod(24, 7).run();
    assert.equal(result, 3);


  }
  catch(e) {
    throw e;
  }
})
it('`mod` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).mod().run();
  }
  catch(e) {
    if (e.message === "`mod` takes 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`mod` should throw if more than two arguments -- r.mod', async () => {
  try {
    let result: any = await r.mod(24, 7, 2).run();
  }
  catch(e) {
    if (e.message === "`r.mod` takes 2 arguments, 3 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`and` should work', async () => {
  try {
    let result: any = await r.expr(true).and(false).run();
    assert.equal(result, false);

    result = await r.expr(true).and(true).run();
    assert.equal(result, true);

    result = await r.and(true, true, true).run();
    assert.equal(result, true);

    result = await r.and(true, true, true, false).run();
    assert.equal(result, false);

    result = await r.and(r.args([true, true, true])).run();
    assert.equal(result, true);


  }
  catch(e) {
    throw e;
  }
})
it('`and` should work if no argument has been passed -- r.and', async () => {
  try {
    let result: any = await r.and().run();
    assert.equal(result, true);

  }
  catch(e) {
    throw e;
  }
})
it('`or` should work', async () => {
  try {
    let result: any = await r.expr(true).or(false).run();
    assert.equal(result, true);

    result = await r.expr(false).or(false).run();
    assert.equal(result, false);

    result = await r.or(true, true, true).run();
    assert.equal(result, true);

    result = await r.or(r.args([false, false, true])).run();
    assert.equal(result, true);


    result = await r.or(false, false, false, false).run();
    assert.equal(result, false);

  }
  catch(e) {
    throw e;
  }
})
it('`or` should work if no argument has been passed -- r.or', async () => {
  try {
    let result: any = await r.or().run();
    assert.equal(result, false);

  }
  catch(e) {
    throw e;
  }
})

it('`eq` should work', async () => {
  try {
    let result: any = await r.expr(1).eq(1).run();
    assert.equal(result, true);

    result = await r.expr(1).eq(2).run();
    assert.equal(result, false);

    result = await r.eq(1, 1, 1, 1).run();
    assert.equal(result, true);

    result = await r.eq(1, 1, 2, 1).run();
    assert.equal(result, false);


  }
  catch(e) {
    throw e;
  }
})
it('`eq` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).eq().run();
  }
  catch(e) {
    if (e.message === "`eq` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`eq` should throw if no argument has been passed -- r.eq', async () => {
  try {
    let result: any = await r.eq().run();
  }
  catch(e) {
    if (e.message === "`r.eq` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`eq` should throw if just one argument has been passed -- r.eq', async () => {
  try {
    let result: any = await r.eq(1).run();
  }
  catch(e) {
    if (e.message === "`r.eq` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`ne` should work', async () => {
  try {
    let result: any = await r.expr(1).ne(1).run();
    assert.equal(result, false);

    result = await r.expr(1).ne(2).run();
    assert.equal(result, true);

    result = await r.ne(1, 1, 1, 1).run();
    assert.equal(result, false);

    result = await r.ne(1, 1, 2, 1).run();
    assert.equal(result, true);



  }
  catch(e) {
    throw e;
  }
})
it('`ne` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).ne().run();
  }
  catch(e) {
    if (e.message === "`ne` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`ne` should throw if no argument has been passed -- r.ne', async () => {
  try {
    let result: any = await r.ne().run();
  }
  catch(e) {
    if (e.message === "`r.ne` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`ne` should throw if just one argument has been passed -- r.ne', async () => {
  try {
    let result: any = await r.ne(1).run();
  }
  catch(e) {
    if (e.message === "`r.ne` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`gt` should work', async () => {
  try {
    let result: any = await r.expr(1).gt(2).run();
    assert.equal(result, false);
    result = await r.expr(2).gt(2).run();
    assert.equal(result, false);
    result = await r.expr(3).gt(2).run();
    assert.equal(result, true);

    result = await r.gt(10, 9, 7, 2).run();
    assert.equal(result, true);

    result = await r.gt(10, 9, 9, 1).run();
    assert.equal(result, false);


  }
  catch(e) {
    throw e;
  }
})
it('`gt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).gt().run();
  }
  catch(e) {
    if (e.message === "`gt` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`gt` should throw if no argument has been passed -- r.gt', async () => {
  try {
    let result: any = await r.gt().run();
  }
  catch(e) {
    if (e.message === "`r.gt` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`gt` should throw if just one argument has been passed -- r.gt', async () => {
  try {
    let result: any = await r.gt(1).run();
  }
  catch(e) {
    if (e.message === "`r.gt` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`ge` should work', async () => {
  try {
    let result: any = await r.expr(1).ge(2).run();
    assert.equal(result, false);
    result = await r.expr(2).ge(2).run();
    assert.equal(result, true);
    result = await r.expr(3).ge(2).run();
    assert.equal(result, true);

    result = await r.ge(10, 9, 7, 2).run();
    assert.equal(result, true);

    result = await r.ge(10, 9, 9, 1).run();
    assert.equal(result, true);

    result = await r.ge(10, 9, 10, 1).run();
    assert.equal(result, false);


  }
  catch(e) {
    throw e;
  }
})
it('`ge` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).ge().run();
  }
  catch(e) {
    if (e.message === "`ge` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`ge` should throw if no argument has been passed -- r.ge', async () => {
  try {
    let result: any = await r.ge().run();
  }
  catch(e) {
    if (e.message === "`r.ge` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`ge` should throw if just one argument has been passed -- r.ge', async () => {
  try {
    let result: any = await r.ge(1).run();
  }
  catch(e) {
    if (e.message === "`r.ge` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`lt` should work', async () => {
  try {
    let result: any = await r.expr(1).lt(2).run();
    assert.equal(result, true);
    result = await r.expr(2).lt(2).run();
    assert.equal(result, false);
    result = await r.expr(3).lt(2).run();
    assert.equal(result, false);

    result = await r.lt(0, 2, 4, 20).run();
    assert.equal(result, true);

    result = await r.lt(0, 2, 2, 4).run();
    assert.equal(result, false);

    result = await r.lt(0, 2, 1, 20).run();
    assert.equal(result, false);


  }
  catch(e) {
    throw e;
  }
})
it('`lt` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).lt().run();
  }
  catch(e) {
    if (e.message === "`lt` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`lt` should throw if no argument has been passed -- r.lt', async () => {
  try {
    let result: any = await r.lt().run();
  }
  catch(e) {
    if (e.message === "`r.lt` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`lt` should throw if just one argument has been passed -- r.lt', async () => {
  try {
    let result: any = await r.lt(1).run();
  }
  catch(e) {
    if (e.message === "`r.lt` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`le` should work', async () => {
  try {
    let result: any = await r.expr(1).le(2).run();
    assert.equal(result, true);
    result = await r.expr(2).le(2).run();
    assert.equal(result, true);
    result = await r.expr(3).le(2).run();
    assert.equal(result, false);

    result = await r.le(0, 2, 4, 20).run();
    assert.equal(result, true);

    result = await r.le(0, 2, 2, 4).run();
    assert.equal(result, true);

    result = await r.le(0, 2, 1, 20).run();
    assert.equal(result, false);


  }
  catch(e) {
    throw e;
  }
})
it('`le` should throw if no argument has been passed', async () => {
  try {
    let result: any = await r.expr(1).le().run();
  }
  catch(e) {
    if (e.message === "`le` takes at least 1 argument, 0 provided after:\nr.expr(1)") {

    }
    else {
      throw e;
    }
  }
})
it('`le` should throw if no argument has been passed -- r.le', async () => {
  try {
    let result: any = await r.le().run();
  }
  catch(e) {
    if (e.message === "`r.le` takes at least 2 arguments, 0 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`le` should throw if just one argument has been passed -- r.le', async () => {
  try {
    let result: any = await r.le(1).run();
  }
  catch(e) {
    if (e.message === "`r.le` takes at least 2 arguments, 1 provided.") {

    }
    else {
      throw e;
    }
  }
})
it('`not` should work', async () => {
  try {
    let result: any = await r.expr(true).not().run();
    assert.equal(result, false);
    result = await r.expr(false).not().run();
    assert.equal(result, true);


  }
  catch(e) {
    throw e;
  }
})
it('`random` should work', async () => {
  try {
    let result: any = await r.random().run();
    assert((result > 0) && (result < 1));

    result = await r.random(10).run();
    assert((result >= 0) && (result < 10));
    assert.equal(Math.floor(result), result);

    result = await r.random(5, 10).run();
    assert((result >= 5) && (result < 10));
    assert.equal(Math.floor(result), result);

    result = await r.random(5, 10, {float: true}).run();
    assert((result >= 5) && (result < 10));
    assert.notEqual(Math.floor(result), result); // that's "almost" safe

    result = await r.random(5, {float: true}).run();
    assert((result < 5) && (result > 0));
    assert.notEqual(Math.floor(result), result); // that's "almost" safe


  }
  catch(e) {
    throw e;
  }
})
it('`r.floor` should work', async () => {
  try {
    let result: any = await r.floor(1.2).run();
    assert.equal(result, 1);
    result = await r.expr(1.2).floor().run();
    assert.equal(result, 1);
    result = await r.floor(1.8).run();
    assert.equal(result, 1);
    result = await r.expr(1.8).floor().run();
    assert.equal(result, 1);


  }
  catch(e) {
    throw e;
  }
})
it('`r.ceil` should work', async () => {
  try {
    let result: any = await r.ceil(1.2).run();
    assert.equal(result, 2);
    result = await r.expr(1.2).ceil().run();
    assert.equal(result, 2);
    result = await r.ceil(1.8).run();
    assert.equal(result, 2);
    result = await r.expr(1.8).ceil().run();
    assert.equal(result, 2);


  }
  catch(e) {
    throw e;
  }
})
it('`r.round` should work', async () => {
  try {
    let result: any = await r.round(1.8).run();
    assert.equal(result, 2);
    result = await r.expr(1.8).round().run();
    assert.equal(result, 2);
    result = await r.round(1.2).run();
    assert.equal(result, 1);
    result = await r.expr(1.2).round().run();
    assert.equal(result, 1);


  }
  catch(e) {
    throw e;
  }
})

