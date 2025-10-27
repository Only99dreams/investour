// routes/referralRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const referralController = require('../controllers/referralController');

// Public (for tracking)
router.get('/track', referralController.trackReferralClick);

// Protected
router.use(authMiddleware.protect);
router.get('/performance', referralController.getReferralPerformance);

module.exports = router;