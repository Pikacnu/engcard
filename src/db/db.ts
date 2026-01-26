import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const host = process.env.POSTGRESQL_HOST!;
const port = parseInt(process.env.POSTGRESQL_PORT!);
const user = process.env.POSTGRESQL_USER!;
const password = process.env.POSTGRESQL_PASSWORD!;
const database = process.env.POSTGRESQL_DB!;
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host,
  port,
  user,
  password,
  database: isProduction ? database : `${database}_dev`,
});

const db = drizzle({ client: pool });

export { db };
