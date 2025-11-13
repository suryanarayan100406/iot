// pages/api/db.js
// Server-side only DB helper using mysql2/promise (works on Vercel if you provide MYSQL_* env vars)
import mysql from 'mysql2/promise';

let pool = global.__mysqlPool || null;

export async function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });
  global.__mysqlPool = pool;
  return pool;
}
