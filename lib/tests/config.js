"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.host = process.env.WERCKER_RETHINKDB_HOST || 'localhost';
exports.port = parseInt(process.env.WERCKER_RETHINKDB_PORT || '0', 10) || 28015;
exports.authKey = '';
exports.buffer = 2;
exports.max = 5;
// tslint:disable-next-line:variable-name
exports.fake_server = {
    host: process.env.WERCKER_RETHINKDB_HOST || 'localhost',
    port: parseInt(process.env.WERCKER_RETHINKDB_PORT || '0', 10) + 1 || 28016
};
exports.discovery = false;
exports.silent = true;
