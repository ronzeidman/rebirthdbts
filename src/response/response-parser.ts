import { RunOptions } from '../types';

export function getNativeTypes(
  obj: any,
  {
    binaryFormat = 'native',
    groupFormat = 'native',
    timeFormat = 'native'
  }: Pick<RunOptions, 'binaryFormat' | 'groupFormat' | 'timeFormat'> = {}
): any {
  if (Array.isArray(obj)) {
    return obj.map(item =>
      getNativeTypes(item, { binaryFormat, groupFormat, timeFormat })
    );
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (!!obj.$reql_type$) {
    switch (obj.$reql_type$) {
      case 'TIME':
        if (timeFormat === 'native') {
          return new Date(obj.epoch_time * 1000);
        }
        break;
      case 'BINARY':
        if (binaryFormat === 'native') {
          return Buffer.from(obj.data, 'base64');
        }
        break;
      case 'GROUPED_DATA':
        if (groupFormat === 'native') {
          return obj.data.map(([group, reduction]: any) => ({
            group: getNativeTypes(group, {
              binaryFormat,
              groupFormat,
              timeFormat
            }),
            reduction: getNativeTypes(reduction, {
              binaryFormat,
              groupFormat,
              timeFormat
            })
          }));
        }
        break;
    }
  }
  return Object.entries(obj).reduce(
    (acc, [key, val]) => ({ ...acc, [key]: getNativeTypes(val) }),
    {}
  );
}
