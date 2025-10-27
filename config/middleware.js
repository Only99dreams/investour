// middlewares/middleware.js
const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');
const honeypotMiddleware = require('./honeypotMiddleware');
const rateLimiter = require('./rateLimiter');

module.exports = {
  protect: authMiddleware.protect,
  restrictTo: roleMiddleware.restrictTo,
  honeypot: honeypotMiddleware,
  rateLimit: rateLimiter
};