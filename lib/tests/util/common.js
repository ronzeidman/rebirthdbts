"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
function uuid() {
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}
exports.uuid = uuid;
function sleep(timer) {
    return util_1.promisify(setTimeout)(timer);
}
exports.sleep = sleep;
