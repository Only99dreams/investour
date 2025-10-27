const rateLimit = require('rate-limiter-flexible');
const Redis = require('ioredis');

// ✅ CORRECT: Use URL directly
const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Add error handling
redisClient.on('error', (err) => {
  console.error('❌ Security Redis Error:', err.message);
});

// IP-based rate limiter (5 requests per hour)
const ipLimiter = new rateLimit.RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ip_limiter',
  points: 5,
  duration: 3600,
  blockDuration: 3600
});

// Email-based rate limiter (3 requests per hour)
const emailLimiter = new rateLimit.RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'email_limiter',
  points: 3,
  duration: 3600,
  blockDuration: 3600
});

// Phone-based rate limiter (3 requests per hour)
const phoneLimiter = new rateLimit.RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'phone_limiter',
  points: 3,
  duration: 3600,
  blockDuration: 3600
});

// Honeypot field validation
const validateHoneypot = (req, res, next) => {
  const honeypotField = req.body.website || req.body.company_website || '';
  if (honeypotField) {
    return res.status(400).json({
      success: false,
      message: 'Bot detected'
    });
  }
  next();
};

// CAPTCHA validation with development bypass
const validateCaptcha = async (req, res, next) => {
  // ✅ SKIP CAPTCHA IN DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ CAPTCHA verification bypassed in development mode');
    return next();
  }

  // 🔒 REAL CAPTCHA VALIDATION FOR PRODUCTION
  const { recaptchaToken } = req.body;
  
  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA token is required'
    });
  }

  try {
    // Fixed URL (removed extra spaces!)
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA verification failed',
        errors: data['error-codes'] || data.error_codes
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'CAPTCHA verification service unavailable'
    });
  }
};

// IP throttling middleware
const ipThrottling = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    
    // Check if IP is blocked
    const blockedKey = `blocked_ip:${ip}`;
    const isBlocked = await redisClient.get(blockedKey);
    
    if (isBlocked) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
      });
    }

    // Apply rate limiting
    await ipLimiter.consume(ip);
    next();
  } catch (error) {
    if (error instanceof rateLimit.RateLimiterResError) {
      // IP is blocked
      const blockedKey = `blocked_ip:${req.ip}`;
      await redisClient.setex(blockedKey, 3600, 'blocked'); // Block for 1 hour
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
      });
    }
    next(error);
  }
};

module.exports = {
  ipLimiter,
  emailLimiter,
  phoneLimiter,
  validateHoneypot,
  validateCaptcha,
  ipThrottling,
  redisClient
};