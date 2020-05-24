const isFunction = (value: any): value is Function => typeof value === 'function';

const isObject = (value: any): value is Object => value !== null && typeof value === 'object';

export { isFunction, isObject };
