/**
 * MySQL database connection pool
 * PCHS Bamenda - Backend
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pchs_registration',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test connection on load
pool.getConnection()
  .then((conn) => {
    conn.release();
    console.log('[DB] MySQL connected');
  })
  .catch((err) => console.error('[DB] Connection failed:', err.message));

module.exports = pool;
