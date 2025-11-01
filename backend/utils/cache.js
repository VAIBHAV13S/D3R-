/**
 * API Response Caching Utility
 * Uses node-cache for in-memory caching with TTL
 */

const NodeCache = require('node-cache');
const logger = require('./logger');

// Create cache instances with different TTLs
const caches = {
  // Short-lived cache (1 minute) - frequently changing data
  short: new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false,
  }),
  
  // Medium cache (5 minutes) - moderately changing data
  medium: new NodeCache({
    stdTTL: 300,
    checkperiod: 600,
    useClones: false,
  }),
  
  // Long cache (30 minutes) - rarely changing data
  long: new NodeCache({
    stdTTL: 1800,
    checkperiod: 3600,
    useClones: false,
  }),
};

// Cache statistics
caches.short.on('set', (key, value) => {
  logger.debug('Cache SET', { cache: 'short', key });
});

caches.short.on('expired', (key, value) => {
  logger.debug('Cache EXPIRED', { cache: 'short', key });
});

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @param {string} ttl - TTL tier: 'short', 'medium', 'long'
 * @returns {*} Cached value or undefined
 */
function get(key, ttl = 'medium') {
  const cache = caches[ttl];
  const value = cache.get(key);
  
  if (value !== undefined) {
    logger.debug('Cache HIT', { key, ttl });
  } else {
    logger.debug('Cache MISS', { key, ttl });
  }
  
  return value;
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {string} ttl - TTL tier: 'short', 'medium', 'long'
 * @param {number} customTTL - Custom TTL in seconds (overrides tier)
 */
function set(key, value, ttl = 'medium', customTTL = null) {
  const cache = caches[ttl];
  
  if (customTTL) {
    cache.set(key, value, customTTL);
  } else {
    cache.set(key, value);
  }
  
  logger.debug('Cache SET', { key, ttl, customTTL });
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @param {string} ttl - TTL tier: 'short', 'medium', 'long'
 */
function del(key, ttl = 'medium') {
  const cache = caches[ttl];
  cache.del(key);
  logger.debug('Cache DELETE', { key, ttl });
}

/**
 * Clear all caches or specific tier
 * @param {string} ttl - TTL tier to clear, or 'all'
 */
function clear(ttl = 'all') {
  if (ttl === 'all') {
    Object.values(caches).forEach(cache => cache.flushAll());
    logger.info('All caches cleared');
  } else if (caches[ttl]) {
    caches[ttl].flushAll();
    logger.info('Cache cleared', { ttl });
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getStats() {
  return {
    short: caches.short.getStats(),
    medium: caches.medium.getStats(),
    long: caches.long.getStats(),
  };
}

/**
 * Middleware to cache GET requests
 * @param {string} ttl - TTL tier: 'short', 'medium', 'long'
 * @param {Function} keyGenerator - Function to generate cache key from req
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttl = 'medium', keyGenerator = null) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator 
      ? keyGenerator(req) 
      : `${req.originalUrl || req.url}`;
    
    // Check cache
    const cached = get(key, ttl);
    
    if (cached) {
      logger.http('Cache HIT - returning cached response', { key });
      return res.json(cached);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = (data) => {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        set(key, data, ttl);
      }
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match keys
 * @param {string} ttl - TTL tier or 'all'
 */
function invalidatePattern(pattern, ttl = 'all') {
  const regex = new RegExp(pattern);
  const tiersToCheck = ttl === 'all' ? Object.keys(caches) : [ttl];
  
  tiersToCheck.forEach(tier => {
    const cache = caches[tier];
    const keys = cache.keys();
    
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.del(key);
        logger.debug('Cache INVALIDATE', { key, tier, pattern });
      }
    });
  });
}

/**
 * Wrap async function with caching
 * @param {Function} fn - Async function to wrap
 * @param {string} keyPrefix - Prefix for cache key
 * @param {string} ttl - TTL tier
 * @returns {Function} Wrapped function
 */
function withCache(fn, keyPrefix, ttl = 'medium') {
  return async (...args) => {
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    const cached = get(key, ttl);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = await fn(...args);
    set(key, result, ttl);
    
    return result;
  };
}

module.exports = {
  get,
  set,
  del,
  clear,
  getStats,
  cacheMiddleware,
  invalidatePattern,
  withCache,
};
