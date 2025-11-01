# Rate Limiting Implementation

## Overview
Rate limiting has been implemented using `express-rate-limit` to protect the API from abuse and ensure fair usage across all users.

## Rate Limit Tiers

### 1. **Auth Limiter** (Strictest)
- **Window**: 15 minutes
- **Max Requests**: 5
- **Applied to**: `/api/auth/*`
- **Purpose**: Prevent brute force attacks on authentication

### 2. **Upload Limiter** (Very Strict)
- **Window**: 1 hour
- **Max Requests**: 10
- **Applied to**:
  - `POST /api/ipfs/upload`
  - `POST /api/campaigns/:id/milestones` (with file upload)
- **Purpose**: Prevent IPFS storage abuse and large file spam

### 3. **Write Limiter** (Moderate)
- **Window**: 15 minutes
- **Max Requests**: 50
- **Applied to**:
  - `POST /api/verify-disaster`
  - `POST /api/campaigns`
  - `PUT /api/campaigns/:id`
  - `POST /api/campaigns/:id/cancel`
  - `POST /api/donations`
  - `PUT /api/milestones/:id/approve`
  - `POST /api/milestones/:id/release-funds`
- **Purpose**: Prevent spam and resource exhaustion on write operations

### 4. **Read Limiter** (Lenient)
- **Window**: 15 minutes
- **Max Requests**: 200
- **Applied to**:
  - `GET /api/disasters/:id/status`
  - `GET /api/campaigns`
  - `GET /api/campaigns/:id`
  - `GET /api/campaigns/:id/donations`
  - `GET /api/campaigns/:id/milestones`
  - `GET /api/users/:wallet/donations`
  - `GET /api/stats`
- **Purpose**: Allow reasonable browsing while preventing scraping

## Response Headers

When rate limits are applied, the following headers are included:

- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Time when the limit resets (Unix timestamp)

## Error Response

When rate limit is exceeded:

```json
{
  "message": "Too many requests, please try again later"
}
```

HTTP Status: `429 Too Many Requests`

## Configuration

Rate limits are configured in `backend/server-template.js`:

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Production Recommendations

### 1. **Use Redis Store**
For production with multiple server instances, use a shared store:

```bash
npm install rate-limit-redis redis
```

```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const authLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

### 2. **IP-based vs User-based**
Current implementation uses IP addresses. Consider:
- User-based limits for authenticated endpoints
- IP-based for public endpoints
- Combination of both for maximum security

### 3. **Adjust Limits Based on Usage**
Monitor actual usage patterns and adjust:
- Increase limits for legitimate high-volume users
- Decrease if seeing abuse patterns
- Add per-user premium tiers

### 4. **Whitelist Trusted IPs**
```javascript
const limiter = rateLimit({
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  },
  // ... other config
});
```

### 5. **Custom Key Generator**
For authenticated routes, use user ID instead of IP:

```javascript
const userLimiter = rateLimit({
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  // ... other config
});
```

## Monitoring

Track rate limit hits to identify:
- Potential attacks
- Legitimate users hitting limits
- Need for limit adjustments

Add logging:

```javascript
const limiter = rateLimit({
  handler: (req, res) => {
    console.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      user: req.user?.id,
    });
    res.status(429).json({
      message: 'Too many requests, please try again later'
    });
  },
  // ... other config
});
```

## Testing Rate Limits

### Manual Testing
```bash
# Test auth limiter (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/nonce \
    -H "Content-Type: application/json" \
    -d '{"walletAddress":"0x1234567890123456789012345678901234567890"}'
  echo ""
done
```

### Automated Testing
```javascript
// test/rate-limit.test.js
const request = require('supertest');
const app = require('../server');

describe('Rate Limiting', () => {
  it('should block after 5 auth requests', async () => {
    const requests = Array(6).fill().map(() =>
      request(app)
        .post('/api/auth/nonce')
        .send({ walletAddress: '0x1234...' })
    );
    
    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];
    
    expect(lastResponse.status).toBe(429);
  });
});
```

## Bypass for Development

Set environment variable to disable rate limiting in development:

```javascript
const limiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({ /* config */ });
```

## Security Considerations

1. **DDoS Protection**: Rate limiting is NOT a complete DDoS solution. Use:
   - Cloudflare or similar CDN
   - Nginx rate limiting
   - AWS Shield/WAF

2. **Distributed Attacks**: IP-based limiting can be bypassed with botnets
   - Implement CAPTCHA for suspicious patterns
   - Use fingerprinting techniques
   - Monitor for distributed attacks

3. **Legitimate High-Volume Users**:
   - Provide API keys with higher limits
   - Implement tiered access
   - Allow limit increase requests

## Troubleshooting

### Users Reporting False Positives

1. Check if behind proxy/NAT (shared IP)
2. Verify rate limit windows
3. Review logs for actual usage
4. Consider increasing limits for specific routes

### Rate Limits Not Working

1. Ensure middleware is before routes
2. Check Redis connection (if using)
3. Verify headers in response
4. Test with curl/Postman

## Future Enhancements

- [ ] Add Redis store for production
- [ ] Implement user-based limits for authenticated routes
- [ ] Add monitoring dashboard
- [ ] Create admin API to adjust limits
- [ ] Implement dynamic limits based on server load
- [ ] Add CAPTCHA for repeated violations
- [ ] Create API key system with custom limits
