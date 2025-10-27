// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const honeypotMiddleware = require('../middlewares/honeypotMiddleware');

// Login
router.post('/login', 
  body('email').isEmail(),
  body('password').notEmpty(),
  authController.login
);

// OTP & Email
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/request-email-verification', authController.requestEmailVerification);
router.get('/verify-email/:token', authController.verifyEmail);

// Session
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;