"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RebirthDBErrorType;
(function (RebirthDBErrorType) {
    RebirthDBErrorType[RebirthDBErrorType["UNKNOWN"] = 0] = "UNKNOWN";
    RebirthDBErrorType[RebirthDBErrorType["CURSOR_END"] = 1] = "CURSOR_END";
    // connection error
    RebirthDBErrorType[RebirthDBErrorType["AUTH"] = 2] = "AUTH";
    // reql response errors
    RebirthDBErrorType[RebirthDBErrorType["INTERNAL"] = 3] = "INTERNAL";
    RebirthDBErrorType[RebirthDBErrorType["RESOURCE_LIMIT"] = 4] = "RESOURCE_LIMIT";
    RebirthDBErrorType[RebirthDBErrorType["QUERY_LOGIC"] = 5] = "QUERY_LOGIC";
    RebirthDBErrorType[RebirthDBErrorType["NON_EXISTENCE"] = 6] = "NON_EXISTENCE";
    RebirthDBErrorType[RebirthDBErrorType["OP_FAILED"] = 7] = "OP_FAILED";
    RebirthDBErrorType[RebirthDBErrorType["OP_INDETERMINATE"] = 8] = "OP_INDETERMINATE";
    RebirthDBErrorType[RebirthDBErrorType["USER"] = 9] = "USER";
    RebirthDBErrorType[RebirthDBErrorType["PERMISSION_ERROR"] = 10] = "PERMISSION_ERROR";
})(RebirthDBErrorType = exports.RebirthDBErrorType || (exports.RebirthDBErrorType = {}));
//#endregion operations
