import { readFileSync, unlinkSync, writeFileSync } from 'fs';

const dTs = readFileSync('src/proto/ql2.d.ts', { encoding: 'utf8' });
const lines = dTs.split('\n');
const enumsTs = [];
let state: 'ignore' | 'enum' = 'ignore';
for (const line of lines) {
  if (line.includes('enum') && !line.trim().startsWith('/*')) {
    state = 'enum';
    enumsTs.push(line.replace('enum', 'export enum'));
  } else if (state === 'enum') {
    enumsTs.push(line);
  }
  if (line.includes('}')) {
    state = 'ignore';
  }
}
writeFileSync('src/proto/enums.ts', enumsTs.join('\n'));
unlinkSync('src/proto/ql2.js');
unlinkSync('src/proto/ql2.d.ts');
