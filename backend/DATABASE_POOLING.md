# Database Connection Pooling

## Overview

The backend uses PostgreSQL connection pooling to efficiently manage database connections, improve performance, and prevent resource exhaustion.

## Configuration

### Pool Settings

Located in `backend/db/client.js`:

```javascript
const pool = new Pool({
  max: 20,                      // Maximum pool size
  min: 2,                       // Minimum pool size
  idleTimeoutMillis: 30000,     // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
  statement_timeout: 30000,     // 30 seconds max query time
  query_timeout: 30000,         // 30 seconds
  application_name: 'd3r-backend',
});
```

### Environment Variables

Configure via `.env`:

```bash
# Pool Size
PG_POOL_MAX=20                # Max connections (default: 20)
PG_POOL_MIN=2                 # Min connections (default: 2)

# Timeouts
PG_IDLE_TIMEOUT=30000         # Idle timeout in ms (default: 30000)
PG_CONNECTION_TIMEOUT=2000    # Connection timeout in ms (default: 2000)
PG_STATEMENT_TIMEOUT=30000    # Statement timeout in ms (default: 30000)
PG_QUERY_TIMEOUT=30000        # Query timeout in ms (default: 30000)

# Monitoring
PG_APP_NAME=d3r-backend       # App name in pg_stat_activity
```

## Features

### ✅ Connection Pooling
- Reuses database connections
- Reduces connection overhead
- Improves performance

### ✅ Automatic Scaling
- Maintains minimum connections
- Scales up to maximum as needed
- Releases idle connections

### ✅ Timeout Protection
- Prevents hanging connections
- Kills long-running queries
- Fails fast on connection issues

### ✅ Health Monitoring
- Pool size tracking
- Idle connection count
- Waiting request count

### ✅ Graceful Shutdown
- Closes connections on SIGTERM/SIGINT
- Waits for active queries
- Prevents connection leaks

## Pool Events

The pool emits events for monitoring:

```javascript
pool.on('connect', (client) => {
  console.log('New client connected');
});

pool.on('acquire', (client) => {
  console.log('Client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('Client removed from pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected pool error:', err);
});
```

## Health Check

### Endpoint: GET /api/db/health

Returns detailed pool information:

```json
{
  "ok": true,
  "database": "d3r",
  "timestamp": "2025-11-01T08:24:00.000Z",
  "poolSize": 5,
  "idleCount": 3,
  "waitingCount": 0
}
```

### Fields
- `ok`: Connection successful
- `database`: Database name
- `timestamp`: Current database time
- `poolSize`: Total connections in pool
- `idleCount`: Idle connections
- `waitingCount`: Requests waiting for connection

## Usage

### Basic Query
```javascript
const { query } = require('./db/client');

const result = await query('SELECT * FROM campaigns WHERE id = $1', [id]);
```

### Transaction
```javascript
const { pool } = require('./db/client');

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO campaigns ...');
  await client.query('INSERT INTO milestones ...');
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

### Health Check
```javascript
const { checkConnection } = require('./db/client');

const health = await checkConnection();
if (health.ok) {
  console.log('Database connected:', health.database);
} else {
  console.error('Database error:', health.error);
}
```

## Tuning Guidelines

### Development
```bash
PG_POOL_MAX=5      # Low traffic
PG_POOL_MIN=1      # Save resources
```

### Production
```bash
PG_POOL_MAX=20     # Higher traffic
PG_POOL_MIN=5      # Always ready
```

### High Traffic
```bash
PG_POOL_MAX=50     # Very high traffic
PG_POOL_MIN=10     # Maintain baseline
```

### Calculation
```
Max Pool Size = (Available RAM / Connection Memory) * 0.8
Recommended: 10-20 for most applications
```

## Monitoring

### PostgreSQL Queries

Check active connections:
```sql
SELECT 
  application_name,
  state,
  COUNT(*) 
FROM pg_stat_activity 
WHERE application_name = 'd3r-backend'
GROUP BY application_name, state;
```

Check connection count:
```sql
SELECT COUNT(*) FROM pg_stat_activity 
WHERE application_name = 'd3r-backend';
```

Check long-running queries:
```sql
SELECT 
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE application_name = 'd3r-backend'
  AND state != 'idle'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

### Application Metrics

Log pool stats periodically:
```javascript
setInterval(() => {
  console.log('Pool stats:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
}, 60000); // Every minute
```

## Troubleshooting

### Issue: Pool Exhausted
**Symptom**: "sorry, too many clients already"

**Solutions**:
1. Increase `PG_POOL_MAX`
2. Check for connection leaks (always release clients)
3. Reduce concurrent requests
4. Add connection pooling at database level (PgBouncer)

### Issue: Slow Queries
**Symptom**: Requests timing out

**Solutions**:
1. Add database indexes
2. Optimize queries
3. Increase `PG_STATEMENT_TIMEOUT`
4. Use query caching

### Issue: Connection Timeouts
**Symptom**: "timeout acquiring client"

**Solutions**:
1. Increase `PG_CONNECTION_TIMEOUT`
2. Check database availability
3. Verify network connectivity
4. Check firewall rules

### Issue: Idle Connections
**Symptom**: Too many idle connections

**Solutions**:
1. Decrease `PG_IDLE_TIMEOUT`
2. Decrease `PG_POOL_MIN`
3. Check for connection leaks

## Best Practices

### ✅ Always Release Connections
```javascript
const client = await pool.connect();
try {
  // Use client
} finally {
  client.release(); // Always release!
}
```

### ✅ Use Prepared Statements
```javascript
// Good - prevents SQL injection
await query('SELECT * FROM users WHERE id = $1', [userId]);

// Bad - SQL injection risk
await query(`SELECT * FROM users WHERE id = ${userId}`);
```

### ✅ Handle Errors
```javascript
try {
  await query('SELECT ...');
} catch (err) {
  console.error('Query failed:', err);
  // Handle error appropriately
}
```

### ✅ Use Transactions for Multiple Queries
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Multiple queries
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

### ❌ Don't Create Multiple Pools
```javascript
// Bad - creates multiple pools
const pool1 = new Pool(config);
const pool2 = new Pool(config);

// Good - reuse single pool
const { pool } = require('./db/client');
```

## Performance Tips

### 1. Connection Reuse
Pool automatically reuses connections, reducing overhead.

### 2. Prepared Statements
PostgreSQL caches prepared statements for better performance.

### 3. Batch Operations
```javascript
// Good - single query
await query('INSERT INTO logs VALUES ($1), ($2), ($3)', [a, b, c]);

// Bad - multiple queries
await query('INSERT INTO logs VALUES ($1)', [a]);
await query('INSERT INTO logs VALUES ($1)', [b]);
await query('INSERT INTO logs VALUES ($1)', [c]);
```

### 4. Indexes
Ensure proper indexes on frequently queried columns.

### 5. Query Optimization
Use EXPLAIN ANALYZE to optimize slow queries.

## Graceful Shutdown

The pool automatically closes on process termination:

```javascript
process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});
```

This ensures:
- Active queries complete
- Connections close properly
- No orphaned connections

## Production Recommendations

### 1. Use PgBouncer
For high-traffic applications, add PgBouncer:
```
Application → PgBouncer → PostgreSQL
```

### 2. Monitor Pool Metrics
- Track pool size over time
- Alert on pool exhaustion
- Monitor query duration

### 3. Set Appropriate Limits
```bash
# Based on your database max_connections
# PostgreSQL default: 100
# Leave room for other apps: 100 - 20 = 80
PG_POOL_MAX=80
```

### 4. Use Read Replicas
For read-heavy workloads:
```javascript
const readPool = new Pool({ /* read replica config */ });
const writePool = new Pool({ /* primary config */ });
```

### 5. Implement Circuit Breaker
Prevent cascading failures:
```javascript
if (pool.waitingCount > 10) {
  throw new Error('Database overloaded');
}
```

## Resources

- [node-postgres Documentation](https://node-postgres.com/)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [PgBouncer](https://www.pgbouncer.org/)

## Summary

✅ **Configured**: Pool with sensible defaults  
✅ **Monitored**: Health checks and event logging  
✅ **Resilient**: Timeouts and graceful shutdown  
✅ **Performant**: Connection reuse and prepared statements  
✅ **Production-Ready**: Tunable via environment variables  

Database connection pooling is now optimized for performance and reliability!
