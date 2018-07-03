"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../error/error");
const term_backtrace_1 = require("../error/term-backtrace");
const query_config_1 = require("./query-config");
const term_builder_1 = require("./term-builder");
exports.querySymbol = Symbol('RebirthDBQuery');
exports.isQuery = (query) => ((query !== null && typeof query === 'object') ||
    typeof query === 'function') &&
    exports.querySymbol in query;
function toQuery(term) {
    // Using proxy since:
    //  'classes' -
    //    does not support bracket operation
    //    (unless they inherit from Function and it has no access to the surroundings)
    //  'functions' -
    //    require adding all query functions for each new terms or
    //    changing the prototype each time which is a big performance no-no
    const query = new Proxy(term_builder_1.termBuilder(query_config_1.bracket, term), queryProxyHandler);
    query.term = term;
    return query;
}
exports.toQuery = toQuery;
const proxyKeys = new Set([
    exports.querySymbol,
    'run',
    'do',
    ...query_config_1.termConfig.map(t => t[1])
]);
const queryProxyHandler = {
    get(target, p, receiver) {
        // tslint:disable-next-line:no-shadowed-variable
        const { term } = target;
        switch (p) {
            case 'then':
                throw new error_1.RebirthDBError('Cannot `await` a query, did you forget `run` or `getCursor`?');
            case 'toString':
                return () => term_backtrace_1.backtraceTerm(term)[0];
            case 'run':
                return term_builder_1.runQueryFunc(term);
            case 'getCursor':
                return term_builder_1.getCursorQueryFunc(term);
            case 'do':
                return term_builder_1.doTermFunc(receiver);
        }
        const config = query_config_1.termConfig.find(t => t[1] === p);
        if (config) {
            return term_builder_1.termBuilder(config, term);
        }
        return target[p];
    },
    has(target, p) {
        return p in target || proxyKeys.has(p);
    }
};
