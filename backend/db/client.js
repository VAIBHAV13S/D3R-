require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

// Build config from either DATABASE_URL or individual PG* vars
function buildConfig() {
  const baseConfig = {
    // Connection pool settings
    max: parseInt(process.env.PG_POOL_MAX || '20', 10), // Maximum pool size
    min: parseInt(process.env.PG_POOL_MIN || '2', 10), // Minimum pool size
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10), // 30 seconds
    connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT || '2000', 10), // 2 seconds
    
    // Query settings
    statement_timeout: parseInt(process.env.PG_STATEMENT_TIMEOUT || '30000', 10), // 30 seconds max query time
    query_timeout: parseInt(process.env.PG_QUERY_TIMEOUT || '30000', 10),
    
    // Application name for monitoring
    application_name: process.env.PG_APP_NAME || 'd3r-backend',
  };

  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }
  
  return {
    ...baseConfig,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || undefined,
    database: process.env.PGDATABASE || 'd3r',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(buildConfig());

// Pool event handlers for monitoring
pool.on('connect', (client) => {
  logger.debug('New database client connected');
});

pool.on('acquire', (client) => {
  logger.debug('Client acquired from pool');
});

pool.on('remove', (client) => {
  logger.debug('Client removed from pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected PG client error', { error: err.message, stack: err.stack });
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.logDatabaseQuery(text, duration, res.rowCount);
  return res;
}

// Health check function
async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    return {
      ok: true,
      database: result.rows[0].db,
      timestamp: result.rows[0].now,
      poolSize: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

// Graceful shutdown
async function closePool() {
  try {
    await pool.end();
    logger.info('Database pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
    throw error;
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database pool...');
  await closePool();
  process.exit(0);
});

module.exports = { pool, query, checkConnection, closePool };
