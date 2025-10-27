// middlewares/rateLimiter.js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

// Use the SAME Redis client instance for consistency
const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redisClient.on('error', (err) => {
  console.warn('⚠️ Rate limiter Redis error:', err.message);
});

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'global_limiter',
  points: 100,
  duration: 900, // 15 minutes
  blockDuration: 900
});

// Strict rate limiter for auth routes: 5 requests per hour
const strictLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'strict_limiter',
  points: 5,
  duration: 3600, // 1 hour
  blockDuration: 3600
});

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    
    // Apply stricter limits to auth routes
    const limiter = req.originalUrl.startsWith('/api/auth') ? strictLimiter : globalLimiter;
    
    await limiter.consume(ip);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
};

module.exports = rateLimiter;