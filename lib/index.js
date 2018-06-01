"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var r_1 = require("./query-builder/r");
exports.r = r_1.r;
__export(require("./types"));
var error_1 = require("./error/error");
exports.isRebirthDBError = error_1.isRebirthDBError;
var cursor_1 = require("./response/cursor");
exports.isCursor = cursor_1.isCursor;
