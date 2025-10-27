// middlewares/ipThrottling.js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redisClient.on('error', (err) => {
  console.warn('⚠️ IP throttling Redis error:', err.message);
});

const ipLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ip_throttle',
  points: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW) / 1000 || 3600,
  blockDuration: 3600
});

const ipThrottling = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    await ipLimiter.consume(ip);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again later.'
    });
  }
};

module.exports = ipThrottling;