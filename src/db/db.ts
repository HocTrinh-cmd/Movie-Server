import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';


dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected');
    client.release(); // giải phóng kết nối
  } catch (error: any) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};
