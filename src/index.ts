import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { schema } from './db/schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema: schema });
