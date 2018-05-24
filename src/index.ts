import { isBuffer, isDate, isFunction } from 'util';
import { RebirthdbError } from './error';
import { NULL_BUFFER } from './handshake';
import { ComplexTermJson, TermJson } from './internal-types';
import { Term } from './proto/ql2';
import { RebirthDBSocket } from './socket';
import { R } from './types';
// [TermType, funcName, min arg number, max arg number (-1 = infinite), can have optional args]
// for operations directly under 'r' the max arg number can be increased by 1 since there is no `this`
const funcConfig: Array<[Term.TermType, string, number, number, boolean]> = [
  // DATUM arg parse
  // MAKE_ARRAY arg parse
  // MAKE_OBJ arg parse
  // VAR - function parsing
  // FUNC - function parsing
  // FUNCALL - r.do - special parsing
  // IMPLICIT_VAR - r.row
  // MINVAL - r.minval
  // MAXVAL - r.maxval
  // [Term.TermType.MONDAY, '', -1, false],
  // [Term.TermType.TUESDAY, '', -1, false],
  // [Term.TermType.WEDNESDAY, '', -1, false],
  // [Term.TermType.THURSDAY, '', -1, false],
  // [Term.TermType.FRIDAY, '', -1, false],
  // [Term.TermType.SATURDAY, '', -1, false],
  // [Term.TermType.SUNDAY, '', -1, false],
  // [Term.TermType.JANUARY, '', -1, false],
  // [Term.TermType.FEBRUARY, '', -1, false],
  // [Term.TermType.MARCH, '', -1, false],
  // [Term.TermType.APRIL, '', -1, false],
  // [Term.TermType.MAY, '', -1, false],
  // [Term.TermType.JUNE, '', -1, false],
  // [Term.TermType.JULY, '', -1, false],
  // [Term.TermType.AUGUST, '', -1, false],
  // [Term.TermType.SEPTEMBER, '', -1, false],
  // [Term.TermType.OCTOBER, '', -1, false],
  // [Term.TermType.NOVEMBER, '', -1, false],
  // [Term.TermType.DECEMBER, '', -1, false],
  [Term.TermType.JAVASCRIPT, 'js', 1, 1, false],
  [Term.TermType.UUID, 'uuid', 1, 1, false],
  [Term.TermType.HTTP, 'http', 1, 1, true],
  [Term.TermType.ERROR, 'error', 1, 1, false],
  [Term.TermType.DB, 'db', 0, 0, false], // only under 'r'
  [Term.TermType.TABLE, 'table', 1, 1, false],
  [Term.TermType.GET, 'get', 1, 1, false],
  [Term.TermType.GET_ALL, 'getAll', 1, -1, true],
  [Term.TermType.EQ, 'eq', 1, -1, false],
  [Term.TermType.NE, 'ne', 1, -1, false],
  [Term.TermType.LT, 'lt', 1, -1, false],
  [Term.TermType.LE, 'le', 1, -1, false],
  [Term.TermType.GT, 'gt', 1, -1, false],
  [Term.TermType.GE, 'ge', 1, -1, false],
  [Term.TermType.NOT, 'not', 0, 0, false],
  [Term.TermType.ADD, 'add', 1, -1, false],
  [Term.TermType.SUB, 'sub', 1, -1, false],
  [Term.TermType.MUL, 'mul', 1, -1, false],
  [Term.TermType.DIV, 'div', 1, -1, false],
  [Term.TermType.MOD, 'mod', 1, -1, false],
  [Term.TermType.FLOOR, 'floor', 0, 0, false],
  [Term.TermType.CEIL, 'ceil', 0, 0, false],
  [Term.TermType.ROUND, 'round', 0, -1, false],
  [Term.TermType.APPEND, 'append', 0, 1, false],
  [Term.TermType.PREPEND, 'prepend', 0, 1, false],
  [Term.TermType.DIFFERENCE, 'difference', 1, 1, false],
  [Term.TermType.SET_INSERT, 'setInsert', 1, 1, false],
  [Term.TermType.SET_INTERSECTION, 'setIntersection', 1, 1, false],
  [Term.TermType.SET_UNION, 'setUnion', 1, 1, false],
  [Term.TermType.SET_DIFFERENCE, 'setDifference', 1, 1, false],
  [Term.TermType.SLICE, 'slice', 1, 2, true],
  [Term.TermType.SKIP, 'skip', 1, 1, false],
  [Term.TermType.LIMIT, 'limit', 1, 1, false],
  [Term.TermType.OFFSETS_OF, 'offsetsOf', 1, 1, false],
  [Term.TermType.CONTAINS, 'contains', 1, 1, false],
  [Term.TermType.GET_FIELD, 'getField', 1, 1, false],
  [Term.TermType.KEYS, 'keys', 0, 0, false],
  [Term.TermType.VALUES, 'values', 0, 0, false],
  [Term.TermType.OBJECT, 'object', -1, -1, false],
  [Term.TermType.HAS_FIELDS, 'hasFields', -1, -1, false],
  [Term.TermType.WITH_FIELDS, 'withFields', -1, -1, false],
  [Term.TermType.PLUCK, 'pluck', -1, -1, false],
  [Term.TermType.WITHOUT, 'without', -1, -1, false],
  [Term.TermType.MERGE, 'merge', -1, -1, false],
  // [Term.TermType.BETWEEN_DEPRECATED, '', -1, false],
  [Term.TermType.BETWEEN, 'between', 2, 2, true],
  [Term.TermType.REDUCE, 'reduce', 1, 1, false],
  [Term.TermType.MAP, 'map', 1, -1, false],
  [Term.TermType.FOLD, 'fold', 2, 2, true],
  [Term.TermType.FILTER, 'filter', 1, 1, true],
  [Term.TermType.CONCAT_MAP, 'concatMap', 1, -1, false],
  [Term.TermType.ORDER_BY, 'orderBy', 0, -1, true],
  [Term.TermType.DISTINCT, 'distinct', 0, 0, true],
  [Term.TermType.COUNT, 'count', 0, 1, false],
  [Term.TermType.IS_EMPTY, 'isEmpty', 0, 0, false],
  [Term.TermType.UNION, 'union', 0, -1, true],
  [Term.TermType.NTH, 'nth', 1, 1, false],
  // [Term.TermType.BRACKET, '', 1, 1, false],
  [Term.TermType.INNER_JOIN, 'innerJoin', 2, 2, false],
  [Term.TermType.OUTER_JOIN, 'outerJoin', 2, 2, false],
  [Term.TermType.EQ_JOIN, 'eqJoin', 2, 2, true],
  [Term.TermType.ZIP, 'zip', 0, 0, false],
  [Term.TermType.RANGE, 'range', 0, 2, false],
  [Term.TermType.INSERT_AT, 'insertAt', 2, 2, false],
  [Term.TermType.DELETE_AT, 'deleteAt', 2, 2, false],
  [Term.TermType.CHANGE_AT, 'changeAt', 2, 2, false],
  [Term.TermType.SPLICE_AT, 'spliceAt', 2, 2, false],
  [Term.TermType.COERCE_TO, 'coerceTo', 1, 1, false],
  [Term.TermType.TYPE_OF, 'typeOf', 1, 1, false],
  [Term.TermType.UPDATE, 'update', 1, 1, true],
  [Term.TermType.DELETE, 'delete', 0, 0, true],
  [Term.TermType.REPLACE, 'replace', 1, 1, true],
  [Term.TermType.INSERT, 'insert', 1, 1, true],
  [Term.TermType.DB_CREATE, 'dbCreate', 0, 0, false], // only under 'r'
  [Term.TermType.DB_DROP, 'dbDrop', 0, 0, false], // only under 'r'
  [Term.TermType.DB_LIST, 'dbList', 0, 0, false],
  [Term.TermType.TABLE_CREATE, 'tableCreate', 0, 1, true],
  [Term.TermType.TABLE_DROP, 'tableDrop', 0, 1, false],
  [Term.TermType.TABLE_LIST, 'tableList', 0, 1, false],
  [Term.TermType.CONFIG, 'config', 0, 0, false],
  [Term.TermType.STATUS, 'status', 0, 0, false],
  [Term.TermType.WAIT, 'wait', 0, 0, true],
  [Term.TermType.RECONFIGURE, 'reconfigure', 0, 0, true],
  [Term.TermType.REBALANCE, 'rebalance', 0, 0, false],
  [Term.TermType.SYNC, 'sync', 0, 0, false],
  [Term.TermType.GRANT, 'grant', 1, 1, true],
  [Term.TermType.INDEX_CREATE, 'indexCreate', 1, 2, true],
  [Term.TermType.INDEX_DROP, 'indexDrop', 1, 1, false],
  [Term.TermType.INDEX_LIST, 'indexList', 0, 0, false],
  [Term.TermType.INDEX_STATUS, 'indexStatus', 1, -1, false],
  [Term.TermType.INDEX_WAIT, 'indexWait', 1, -1, false],
  [Term.TermType.INDEX_RENAME, 'indexRename', 2, 2, true],
  [Term.TermType.SET_WRITE_HOOK, 'setWriteHook', -1, -1, true], // not documented
  [Term.TermType.GET_WRITE_HOOK, 'getWriteHoot', -1, -1, true], // not documented
  [Term.TermType.BRANCH, 'branch', 3, -1, false],
  [Term.TermType.OR, 'or', 1, -1, false],
  [Term.TermType.AND, 'and', 1, -1, false],
  [Term.TermType.FOR_EACH, 'forEach', 1, 1, false],
  [Term.TermType.ASC, 'asc', 0, 0, false], // only under r
  [Term.TermType.DESC, 'desc', 0, 0, false], // only under r
  [Term.TermType.INFO, 'info', 0, 0, false],
  [Term.TermType.MATCH, 'match', 0, 0, false],
  [Term.TermType.UPCASE, 'upcase', 0, 0, false],
  [Term.TermType.DOWNCASE, 'downcase', 0, 0, false],
  [Term.TermType.SAMPLE, 'sample', 1, 1, false],
  [Term.TermType.DEFAULT, 'default', 1, 1, false],
  [Term.TermType.JSON, 'json', 1, 1, false],
  [Term.TermType.ISO8601, 'ISO8601', 1, 1, true],
  [Term.TermType.TO_ISO8601, 'toISO8601', 0, 0, false],
  [Term.TermType.EPOCH_TIME, 'epochTime', 0, 0, false], // only under r
  [Term.TermType.TO_EPOCH_TIME, 'toEpochTime', 0, 0, false],
  [Term.TermType.NOW, 'now', 0, 0, false],
  [Term.TermType.IN_TIMEZONE, 'inTimezone', 1, 1, false],
  [Term.TermType.DURING, 'during', 2, 2, true],
  [Term.TermType.DATE, 'date', 0, 0, false],
  [Term.TermType.TIME_OF_DAY, 'timeOfDay', 0, 0, false],
  [Term.TermType.TIMEZONE, 'timezone', 0, 0, false],
  [Term.TermType.YEAR, 'year', 0, 0, false],
  [Term.TermType.MONTH, 'month', 0, 0, false],
  [Term.TermType.DAY, 'day', 0, 0, false],
  [Term.TermType.DAY_OF_WEEK, 'dayOfWeek', 0, 0, false],
  [Term.TermType.DAY_OF_YEAR, 'dayOfYear', 0, 0, false],
  [Term.TermType.HOURS, 'hours', 0, 0, false],
  [Term.TermType.MINUTES, 'minutes', 0, 0, false],
  [Term.TermType.SECONDS, 'seconds', 0, 0, false],
  [Term.TermType.TIME, 'time', 4, 7, false],
  [Term.TermType.LITERAL, 'literal', 1, 1, false],
  [Term.TermType.GROUP, 'group', 1, -1, true],
  [Term.TermType.SUM, 'sum', 1, 1, false],
  [Term.TermType.AVG, 'avg', 1, 1, false],
  [Term.TermType.MIN, 'min', 0, 1, true],
  [Term.TermType.MAX, 'max', 0, 1, true],
  [Term.TermType.SPLIT, 'split', 1, 2, false],
  [Term.TermType.UNGROUP, 'ungroup', 0, 0, false],
  [Term.TermType.RANDOM, 'random', 0, 2, true],
  [Term.TermType.CHANGES, 'changes', 0, 0, true],
  [Term.TermType.ARGS, 'args', 1, 1, false],
  [Term.TermType.BINARY, 'binary', 1, 1, false],
  [Term.TermType.GEOJSON, 'geojson', 1, 1, false],
  [Term.TermType.TO_GEOJSON, 'toGeojson', 0, 0, false],
  [Term.TermType.POINT, 'point', 2, 2, false],
  [Term.TermType.LINE, 'line', 2, -1, false],
  [Term.TermType.POLYGON, 'polygon', 2, -1, false],
  [Term.TermType.DISTANCE, 'distance', 2, 2, true],
  [Term.TermType.INTERSECTS, 'intersects', 2, 2, false],
  [Term.TermType.INCLUDES, 'includes', 1, 1, false],
  [Term.TermType.CIRCLE, 'circle', 2, 2, true],
  [Term.TermType.GET_INTERSECTING, 'getIntersecting', 1, 1, true],
  [Term.TermType.FILL, 'fill', 0, 0, false],
  [Term.TermType.GET_NEAREST, 'getNearest', 1, 1, true],
  [Term.TermType.POLYGON_SUB, 'polygonSub', 1, 1, false],
  [Term.TermType.TO_JSON_STRING, 'toJsonString', 0, 0, false],
  [Term.TermType.TO_JSON_STRING, 'toJSON', 0, 0, false],
  [Term.TermType.BIT_AND, 'bitAnd', -1, -1, true], // not documented
  [Term.TermType.BIT_OR, 'bitOr', -1, -1, true], // not documented
  [Term.TermType.BIT_XOR, 'bitXor', -1, -1, true], // not documented
  [Term.TermType.BIT_NOT, 'bitNot', -1, -1, true], // not documented
  [Term.TermType.BIT_SAL, 'bitShiftLeft', -1, -1, true], // not documented
  [Term.TermType.BIT_SAR, 'bitShiftRight', -1, -1, true] // not documented
];

function parseParam(param: any): TermJson {
  if (param instanceof RebirthDB) {
    if (!param.term) {
      throw new RebirthdbError("'r' cannot be an argument");
    }
    return param.term;
  }
  if (Array.isArray(param)) {
    return [Term.TermType.MAKE_ARRAY, param.map(p => parseParam(p))];
  }
  if (isDate(param)) {
    return {
      $reql_type$: 'TIME',
      epochTime: param.getTime(),
      timezone: '+00:00'
    };
  }
  if (isBuffer(param)) {
    return {
      $reql_type$: 'BINARY',
      data: param.toString('base64')
    };
  }
  if (isFunction(param)) {
    return [
      Term.TermType.FUNC,
      [
        [
          Term.TermType.MAKE_ARRAY,
          Array(param.length)
            .fill(0)
            .map((_, i) => i + 1)
        ],
        param(
          ...Array(param.length)
            .fill(0)
            .map((_, i) => ({ term: [Term.TermType.VAR, [i + 1]] }))
        ).term
      ]
    ];
  }
  return param;
}

// tslint:disable-next-line:no-empty
class RebirthDB {
  constructor(public term?: TermJson) {}
}
// tslint:disable-next-line:only-arrow-functions
funcConfig.forEach(
  config =>
    ((RebirthDB.prototype as any)[config[1]] = function(...args: any[]) {
      const argsLength = this.term ? args.length : Math.max(args.length - 1, 0);
      if (argsLength < config[2]) {
        throw new RebirthdbError(`Expecting at least ${config[2]} arguments`);
      }
      if (config[3] !== -1 && argsLength > config[3]) {
        throw new RebirthdbError(`Expecting at most ${config[3]} arguments`);
      }
      const params = this.term ? [this.term] : [];
      const maybeOptarg = args.length ? args.pop() : undefined;
      const optarg =
        config[4] &&
        typeof maybeOptarg === 'object' &&
        !(maybeOptarg instanceof RebirthDB)
          ? maybeOptarg
          : undefined;
      if (maybeOptarg && !optarg) {
        args.push(maybeOptarg);
      }
      params.push(...args.map(parseParam));
      const term: ComplexTermJson = [config[0]];
      if (params.length > 0) {
        term[1] = params;
      }
      if (optarg) {
        term[2] = optarg;
      }
      return new RebirthDB(term);
    })
);
const r: R = new RebirthDB() as any;

// Term.TermType.DB;

(async ({ user = 'admin', password = NULL_BUFFER } = {}) => {
  try {
    const rsocket = new RebirthDBSocket();
    await rsocket.connect();
    console.log('Connected!');
    console.log(
      await rsocket.query((r.db('test_db').table('test_table') as any).term)
    );
  } catch (error) {
    console.log(error);
  }
})();
