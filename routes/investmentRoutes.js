// routes/investmentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const investmentController = require('../controllers/investmentController');

// Public route
router.get('/', investmentController.getVettedInvestments);

// Protected route
router.use(authMiddleware.protect);
router.post('/invest', investmentController.investInOpportunity);

module.exports = router;