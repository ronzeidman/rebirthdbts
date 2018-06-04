"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RebirthDBErrorType;
(function (RebirthDBErrorType) {
    RebirthDBErrorType[RebirthDBErrorType["UNKNOWN"] = 0] = "UNKNOWN";
    // driver
    RebirthDBErrorType[RebirthDBErrorType["API_FAIL"] = 1] = "API_FAIL";
    // query errors
    RebirthDBErrorType[RebirthDBErrorType["CONNECTION"] = 2] = "CONNECTION";
    RebirthDBErrorType[RebirthDBErrorType["POOL_FAIL"] = 3] = "POOL_FAIL";
    RebirthDBErrorType[RebirthDBErrorType["CURSOR_END"] = 4] = "CURSOR_END";
    RebirthDBErrorType[RebirthDBErrorType["TIMEOUT"] = 5] = "TIMEOUT";
    RebirthDBErrorType[RebirthDBErrorType["CANCEL"] = 6] = "CANCEL";
    RebirthDBErrorType[RebirthDBErrorType["PARSE"] = 7] = "PARSE";
    RebirthDBErrorType[RebirthDBErrorType["ARITY"] = 8] = "ARITY";
    RebirthDBErrorType[RebirthDBErrorType["CURSOR"] = 9] = "CURSOR";
    // connection error
    RebirthDBErrorType[RebirthDBErrorType["AUTH"] = 10] = "AUTH";
    RebirthDBErrorType[RebirthDBErrorType["UNSUPPORTED_PROTOCOL"] = 11] = "UNSUPPORTED_PROTOCOL";
    // reql response errors
    RebirthDBErrorType[RebirthDBErrorType["INTERNAL"] = 12] = "INTERNAL";
    RebirthDBErrorType[RebirthDBErrorType["RESOURCE_LIMIT"] = 13] = "RESOURCE_LIMIT";
    RebirthDBErrorType[RebirthDBErrorType["QUERY_LOGIC"] = 14] = "QUERY_LOGIC";
    RebirthDBErrorType[RebirthDBErrorType["NON_EXISTENCE"] = 15] = "NON_EXISTENCE";
    RebirthDBErrorType[RebirthDBErrorType["OP_FAILED"] = 16] = "OP_FAILED";
    RebirthDBErrorType[RebirthDBErrorType["OP_INDETERMINATE"] = 17] = "OP_INDETERMINATE";
    RebirthDBErrorType[RebirthDBErrorType["USER"] = 18] = "USER";
    RebirthDBErrorType[RebirthDBErrorType["PERMISSION_ERROR"] = 19] = "PERMISSION_ERROR";
})(RebirthDBErrorType = exports.RebirthDBErrorType || (exports.RebirthDBErrorType = {}));
//#endregion operations
