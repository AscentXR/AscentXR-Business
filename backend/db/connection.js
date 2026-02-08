const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://ascentxr_user:password@localhost:5432/ascentxr',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Helper to run queries
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

// Helper to get a client for transactions
async function getClient() {
  return pool.connect();
}

// Test database connection
async function testConnection() {
  try {
    const res = await query('SELECT NOW()');
    console.log('Database connected:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
}

// Run migrations
async function runMigrations() {
  const fs = require('fs');
  const path = require('path');
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await query(sql);
      console.log(`Migration applied: ${file}`);
    } catch (err) {
      // Skip if already applied (tables exist)
      if (err.code === '42P07') {
        console.log(`Migration already applied: ${file}`);
      } else {
        console.error(`Migration failed: ${file}`, err.message);
      }
    }
  }
}

module.exports = { pool, query, getClient, testConnection, runMigrations };
