"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
// import { Connection, r } from '../src';
const config = __importStar(require("./config"));
// let connection: Connection; // global connection
// let dbName: string;
// let tableName: string;
// let result: any;
(async () => {
    await src_1.r.connect(config);
    console.log(JSON.stringify(await dbCleanup(), null, '\t'));
    process.exit();
})();
function dbCleanup() {
    return Promise.all([
        src_1.r
            .db('rethinkdb')
            .table('users')
            .filter(row => row('id').ne('admin'))
            .delete()
            .run(),
        src_1.r
            .dbList()
            .filter(db => src_1.r
            .expr(['rethinkdb'])
            .contains(db)
            .not())
            .forEach(db => src_1.r.dbDrop(db))
            .run()
    ]);
}
