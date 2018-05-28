export const host = process.env.WERCKER_RETHINKDB_HOST || 'localhost';
export const port =
  parseInt(process.env.WERCKER_RETHINKDB_PORT || '0', 10) || 28015;
export const authKey = '';
export const buffer = 2;
export const max = 5;
// tslint:disable-next-line:variable-name
export const fake_server = {
  host: process.env.WERCKER_RETHINKDB_HOST || 'localhost',
  port: parseInt(process.env.WERCKER_RETHINKDB_PORT || '0', 10) + 1 || 28016
};
export const discovery = false;
export const silent = true;
