// utils/otpService.js
const Redis = require('ioredis');

// Create a single shared Redis client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis via ioredis');
});

// Generate OTP
exports.generateOTP = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `otp:${phone}`;
  
  try {
    // ioredis uses setex (seconds) instead of setEx
    await redisClient.setex(key, 600, otp); // 600 seconds = 10 minutes
    return otp;
  } catch (error) {
    console.error('Failed to generate OTP:', error);
    throw new Error('OTP generation failed');
  }
};

// Verify OTP
exports.verifyOTP = async (phone, otp) => {
  const key = `otp:${phone}`;
  
  try {
    const storedOTP = await redisClient.get(key);
    
    if (storedOTP && storedOTP === otp) {
      await redisClient.del(key);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
};

// Export client for other modules
exports.redisClient = redisClient;