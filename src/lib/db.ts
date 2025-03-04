import client from './client';

const dbName = process.env.NODE_ENV === 'development' ? 'test' : 'prod';

const db = client.db(dbName);
export default db;
