const mysql = require('mysql2/promise');

// A pool keeps several connections open and reuses them,
// which is faster than opening a new connection for every request.
// All values come from .env - nothing is hardcoded here.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
