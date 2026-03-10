const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

const parseBoolean = (value, fallback) => {
  if (value == null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const isProduction = process.env.NODE_ENV === 'production';
const sslEnabled = parseBoolean(process.env.DB_SSL, isProduction);
const rejectUnauthorized = parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, isProduction);

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (sslEnabled) {
  // Set DB_SSL_REJECT_UNAUTHORIZED=false only when your provider requires it.
  poolConfig.ssl = {
    rejectUnauthorized,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
