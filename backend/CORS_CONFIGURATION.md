# CORS Configuration Guide

## Overview

CORS (Cross-Origin Resource Sharing) has been configured to restrict API access to trusted origins only, preventing unauthorized cross-origin requests.

## Current Configuration

### Secure CORS Setup

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-admin-key'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};
```

## Features

### ✅ Origin Validation
- Only allows requests from whitelisted origins
- Configurable via environment variable
- Defaults to localhost for development

### ✅ Credentials Support
- Allows cookies and authorization headers
- Required for JWT authentication
- Enables secure session management

### ✅ Method Restrictions
- Only allows necessary HTTP methods
- Prevents unexpected request types
- Improves security posture

### ✅ Header Control
- Specifies allowed request headers
- Exposes rate limit headers to clients
- Prevents header injection attacks

### ✅ Preflight Caching
- 24-hour cache for OPTIONS requests
- Reduces preflight request overhead
- Improves performance

## Environment Configuration

### Development (.env)
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Staging (.env)
```bash
ALLOWED_ORIGINS=https://staging.yourdomain.com,http://localhost:3000
```

### Production (.env)
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

## Testing CORS

### Test Allowed Origin
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/campaigns

# Should return 200 with CORS headers
```

### Test Blocked Origin
```bash
curl -H "Origin: http://evil-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost:5000/api/campaigns

# Should return CORS error
```

### Test with Credentials
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     --cookie "session=abc123" \
     http://localhost:5000/api/campaigns

# Should work with credentials
```

## Frontend Integration

### Fetch API
```javascript
fetch('http://localhost:5000/api/campaigns', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Important!
});

api.post('/api/campaigns', data, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Common Issues

### Issue 1: CORS Error in Browser
**Error**: "Access to fetch at 'http://localhost:5000/api/campaigns' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Solution**:
1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure backend is running
3. Verify no typos in origin URL

### Issue 2: Credentials Not Sent
**Error**: Cookies or auth headers not reaching backend

**Solution**:
```javascript
// Frontend: Add credentials
fetch(url, { credentials: 'include' })

// Or with axios
axios.create({ withCredentials: true })
```

### Issue 3: Preflight Requests Failing
**Error**: OPTIONS request returns 404 or 500

**Solution**:
- CORS middleware must be before routes
- Check allowed methods include the one you're using
- Verify allowed headers include your custom headers

### Issue 4: Mobile App CORS Errors
**Error**: Mobile app can't make requests

**Solution**:
Mobile apps don't send Origin header, so they're allowed by default:
```javascript
if (!origin) return callback(null, true);
```

## Security Best Practices

### 1. Never Use Wildcard in Production
```javascript
// ❌ DON'T DO THIS
app.use(cors({ origin: '*' }));

// ✅ DO THIS
app.use(cors({ origin: process.env.ALLOWED_ORIGINS.split(',') }));
```

### 2. Always Validate Origins
```javascript
// ✅ Good - validates against whitelist
origin: function (origin, callback) {
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

### 3. Use HTTPS in Production
```bash
# Production origins should use HTTPS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 4. Limit Exposed Headers
```javascript
// Only expose necessary headers
exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
```

### 5. Set Appropriate Max Age
```javascript
// Cache preflight for 24 hours
maxAge: 86400
```

## Advanced Configuration

### Dynamic Origin Validation
```javascript
origin: function (origin, callback) {
  // Allow subdomains
  if (origin && origin.match(/^https:\/\/.*\.yourdomain\.com$/)) {
    return callback(null, true);
  }
  
  // Check whitelist
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  callback(new Error('Not allowed by CORS'));
}
```

### Environment-Specific Config
```javascript
const corsOptions = {
  origin: NODE_ENV === 'development' 
    ? true // Allow all in dev
    : function (origin, callback) {
        // Strict validation in production
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
};
```

### Conditional Credentials
```javascript
credentials: NODE_ENV === 'production', // Only in production
```

## Monitoring

### Log CORS Rejections
```javascript
origin: function (origin, callback) {
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    console.warn('CORS rejection:', {
      origin,
      timestamp: new Date().toISOString(),
      allowedOrigins,
    });
    callback(new Error('Not allowed by CORS'));
  }
}
```

### Track CORS Errors
```javascript
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    // Log to monitoring service
    logger.warn('CORS violation', {
      origin: req.headers.origin,
      path: req.path,
      ip: req.ip,
    });
  }
  next(err);
});
```

## Deployment Checklist

- [ ] Set `ALLOWED_ORIGINS` in production environment
- [ ] Use HTTPS URLs for production origins
- [ ] Test CORS with production frontend URL
- [ ] Verify credentials work in production
- [ ] Monitor CORS errors in logs
- [ ] Document allowed origins for team
- [ ] Set up alerts for CORS violations

## Troubleshooting Commands

### Check CORS Headers
```bash
curl -I -H "Origin: http://localhost:3000" http://localhost:5000/api/campaigns
```

Look for:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
```

### Test Preflight
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  http://localhost:5000/api/campaigns
```

### Debug in Browser
```javascript
// In browser console
fetch('http://localhost:5000/api/campaigns', {
  method: 'GET',
  credentials: 'include',
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://expressjs.com/en/resources/middleware/cors.html)
- [CORS Best Practices](https://web.dev/cross-origin-resource-sharing/)

## Summary

✅ **Secure**: Only allows whitelisted origins  
✅ **Flexible**: Configurable via environment variables  
✅ **Production-Ready**: Proper credentials and header handling  
✅ **Performant**: Preflight caching enabled  
✅ **Debuggable**: Clear error messages and logging  

CORS is now properly configured for security and functionality!
