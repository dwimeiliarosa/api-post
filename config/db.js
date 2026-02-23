const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'database_post',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('Database berhasil terkoneksi'))
  .catch(err => console.error('Error koneksi database', err));

module.exports = pool;