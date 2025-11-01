require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./client');

async function main() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('schema.sql not found at', schemaPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    // Basic connectivity check
    console.log('Checking database connection...');
    await pool.query('SELECT 1');
    console.log('Connection OK. Applying database schema...');
    await pool.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err);
    if (process.env.DATABASE_URL) {
      console.error('Using DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@/]+@/, '://****@'));
    } else {
      console.error('PG config:', {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        ssl: process.env.PGSSL,
      });
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
