import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

// Kiểm tra xem có đang chạy trên môi trường Production (Render) không
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // QUAN TRỌNG: Thêm cấu hình SSL cho Render
  ssl: isProduction
    ? { rejectUnauthorized: false } // Chấp nhận Self-signed Cert của Render/Cloud
    : undefined, // Localhost thường không cần SSL
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected Successfully');
    client.release();
  } catch (error: any) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    // Lưu ý: Nếu process.exit(1) ở đây, Render sẽ báo "Command failed" ngay lập tức
    process.exit(1); 
  }
};