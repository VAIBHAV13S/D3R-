# Logging Guide

## Overview

The backend uses Winston for structured logging with multiple transports, log levels, and automatic error handling.

## Configuration

### Logger Setup

Located in `backend/utils/logger.js`:

```javascript
const logger = require('./utils/logger');

logger.info('Application started');
logger.error('Error occurred', { error: err.message });
logger.debug('Debug information', { data: someData });
```

### Log Levels

Ordered by priority (highest to lowest):

1. **error** - Error events that might still allow the application to continue
2. **warn** - Warning messages for potentially harmful situations
3. **info** - Informational messages highlighting progress
4. **http** - HTTP request/response logging
5. **debug** - Detailed information for debugging

### Environment Configuration

Set log level via environment variable:

```bash
# .env
LOG_LEVEL=info          # Production
LOG_LEVEL=debug         # Development
LOG_LEVEL=error         # Minimal logging
```

## Log Transports

### File Transports

**combined.log**
- All log levels
- Max size: 5MB
- Max files: 5 (rotated)
- Location: `backend/logs/combined.log`

**error.log**
- Error level only
- Max size: 5MB
- Max files: 5 (rotated)
- Location: `backend/logs/error.log`

**exceptions.log**
- Uncaught exceptions
- Location: `backend/logs/exceptions.log`

**rejections.log**
- Unhandled promise rejections
- Location: `backend/logs/rejections.log`

### Console Transport

- **Development only** (NODE_ENV !== 'production')
- Colorized output
- Human-readable format
- Includes timestamps

## Usage Examples

### Basic Logging

```javascript
const logger = require('./utils/logger');

// Info level
logger.info('User logged in', { userId: '123', ip: req.ip });

// Warning level
logger.warn('Rate limit approaching', { endpoint: '/api/auth', count: 4 });

// Error level
logger.error('Database connection failed', { error: err.message });

// Debug level
logger.debug('Cache hit', { key: 'campaign:123', ttl: 60 });
```

### HTTP Request Logging

Automatically logged via middleware:

```javascript
// Middleware in server-template.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});
```

Output:
```json
{
  "level": "http",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/campaigns",
  "status": 200,
  "duration": "45ms",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Error Logging

```javascript
// Using helper method
logger.logError(error, {
  userId: req.user?.id,
  endpoint: req.path,
  method: req.method,
});

// Manual error logging
logger.error('Payment processing failed', {
  error: err.message,
  stack: err.stack,
  transactionId: '123',
  amount: 100,
});
```

### Database Query Logging

Automatically logged in debug mode:

```javascript
// In db/client.js
logger.logDatabaseQuery(query, duration, rowCount);
```

Output (debug level only):
```json
{
  "level": "debug",
  "message": "Database Query",
  "query": "SELECT * FROM campaigns WHERE...",
  "duration": "12ms",
  "rows": 5
}
```

## Log Format

### Production (JSON)

```json
{
  "timestamp": "2025-11-01 08:25:00",
  "level": "info",
  "message": "Server started",
  "env": "production",
  "port": 5000
}
```

### Development (Console)

```
2025-11-01 08:25:00 [info]: Server started
2025-11-01 08:25:01 [http]: GET /api/campaigns 200 45ms
2025-11-01 08:25:02 [error]: Database error
  Error: Connection timeout
    at Pool.connect (/app/db/client.js:42:15)
```

## Helper Methods

### logRequest(req, res, duration)

Logs HTTP requests with metadata:

```javascript
logger.logRequest(req, res, 45);
```

### logError(error, context)

Logs errors with context:

```javascript
logger.logError(new Error('Failed'), {
  userId: '123',
  action: 'create_campaign',
});
```

### logDatabaseQuery(query, duration, rows)

Logs database queries (debug level):

```javascript
logger.logDatabaseQuery('SELECT * FROM users', 12, 5);
```

## Integration Examples

### Express Middleware

```javascript
// Custom logging middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});
```

### Error Handler

```javascript
// In error handler middleware
function handleError(err, req, res, next) {
  logger.logError(err, {
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
  });
  
  res.status(err.statusCode || 500).json({
    error: err.message,
  });
}
```

### Database Operations

```javascript
async function createCampaign(data) {
  try {
    logger.info('Creating campaign', { title: data.title });
    const result = await query('INSERT INTO campaigns...', [data]);
    logger.info('Campaign created', { id: result.id });
    return result;
  } catch (error) {
    logger.error('Campaign creation failed', {
      error: error.message,
      data: data.title,
    });
    throw error;
  }
}
```

### Async Operations

```javascript
async function uploadToIPFS(file) {
  logger.debug('Starting IPFS upload', { filename: file.name });
  
  try {
    const result = await pinata.upload(file);
    logger.info('IPFS upload successful', { cid: result.IpfsHash });
    return result;
  } catch (error) {
    logger.error('IPFS upload failed', {
      error: error.message,
      filename: file.name,
    });
    throw error;
  }
}
```

## Log Rotation

Winston automatically rotates log files:

- **Max size**: 5MB per file
- **Max files**: 5 files kept
- **Naming**: `combined.log`, `combined.log.1`, `combined.log.2`, etc.

Manual rotation not required.

## Monitoring

### View Logs in Real-Time

```bash
# All logs
tail -f backend/logs/combined.log

# Errors only
tail -f backend/logs/error.log

# Filter by level
grep "error" backend/logs/combined.log

# Filter by message
grep "Database" backend/logs/combined.log
```

### Parse JSON Logs

```bash
# Pretty print JSON logs
cat backend/logs/combined.log | jq '.'

# Filter by level
cat backend/logs/combined.log | jq 'select(.level == "error")'

# Filter by time range
cat backend/logs/combined.log | jq 'select(.timestamp > "2025-11-01")'
```

## Production Recommendations

### 1. External Log Aggregation

Send logs to external service:

```javascript
// Add transport for external service
logger.add(new winston.transports.Http({
  host: 'logs.example.com',
  port: 443,
  path: '/logs',
  ssl: true,
}));
```

### 2. Log to Syslog

```bash
npm install winston-syslog
```

```javascript
const { Syslog } = require('winston-syslog');

logger.add(new Syslog({
  host: 'localhost',
  port: 514,
  protocol: 'udp4',
}));
```

### 3. Structured Logging

Always include context:

```javascript
// Good
logger.info('User action', {
  userId: user.id,
  action: 'login',
  ip: req.ip,
  timestamp: Date.now(),
});

// Bad
logger.info('User logged in');
```

### 4. Sensitive Data

Never log sensitive information:

```javascript
// Bad
logger.info('User created', { password: user.password });

// Good
logger.info('User created', { userId: user.id, email: user.email });
```

### 5. Performance

Avoid logging in tight loops:

```javascript
// Bad
for (let i = 0; i < 10000; i++) {
  logger.debug('Processing item', { index: i });
}

// Good
logger.debug('Processing items', { count: 10000 });
// ... process items ...
logger.debug('Items processed', { count: 10000 });
```

## Debugging

### Enable Debug Logging

```bash
# Set log level to debug
LOG_LEVEL=debug npm start
```

### Filter Logs

```bash
# Show only errors
LOG_LEVEL=error npm start

# Show info and above
LOG_LEVEL=info npm start
```

### Custom Debug Logging

```javascript
if (process.env.LOG_LEVEL === 'debug') {
  logger.debug('Detailed state', {
    state: JSON.stringify(complexObject),
    memory: process.memoryUsage(),
  });
}
```

## Log Analysis

### Common Queries

**Find all errors:**
```bash
grep '"level":"error"' logs/combined.log
```

**Count requests by endpoint:**
```bash
grep '"level":"http"' logs/combined.log | jq -r '.url' | sort | uniq -c
```

**Average response time:**
```bash
grep '"level":"http"' logs/combined.log | jq -r '.duration' | sed 's/ms//' | awk '{sum+=$1; count++} END {print sum/count}'
```

**Errors by type:**
```bash
grep '"level":"error"' logs/combined.log | jq -r '.error' | sort | uniq -c
```

## Best Practices

### ✅ Do

1. **Use appropriate log levels** - Don't log everything as info
2. **Include context** - Add relevant metadata
3. **Log errors with stack traces** - Use logger.logError()
4. **Log request/response** - Track API usage
5. **Rotate logs** - Prevent disk space issues

### ❌ Don't

1. **Don't log passwords** - Or any sensitive data
2. **Don't log in loops** - Performance impact
3. **Don't use console.log** - Use logger instead
4. **Don't ignore errors** - Always log errors
5. **Don't log too much** - Balance detail vs. noise

## Troubleshooting

### Issue: Logs not appearing

**Check log level:**
```bash
echo $LOG_LEVEL
```

**Check file permissions:**
```bash
ls -la logs/
```

**Check disk space:**
```bash
df -h
```

### Issue: Log files too large

**Reduce log level:**
```bash
LOG_LEVEL=warn
```

**Increase rotation:**
```javascript
maxsize: 1048576, // 1MB
maxFiles: 10,
```

### Issue: Performance impact

**Disable debug logging:**
```bash
LOG_LEVEL=info
```

**Use async logging:**
```javascript
// Winston logs asynchronously by default
```

## Migration from console.log

### Before
```javascript
console.log('Server started');
console.error('Error:', err);
console.log('User:', user.id);
```

### After
```javascript
logger.info('Server started');
logger.error('Error occurred', { error: err.message });
logger.info('User action', { userId: user.id });
```

## Summary

✅ **Winston** - Structured logging library  
✅ **Multiple Transports** - Files, console, external  
✅ **Log Levels** - error, warn, info, http, debug  
✅ **Automatic Rotation** - 5MB files, 5 backups  
✅ **Error Handling** - Uncaught exceptions, rejections  
✅ **Production Ready** - JSON format, external integration  

Logging is now comprehensive and production-ready!
