// routes/firmRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const firmController = require('../controllers/firmController');
const investmentController = require('../controllers/investmentController');

router.use(authMiddleware.protect);

// Firm dashboard
router.get('/dashboard', firmController.getFirmDashboard);

// Investments
router.post('/investments', firmController.submitInvestment);
router.get('/investments', firmController.getInvestments);

// Public investments
router.get('/public-investments', investmentController.getVettedInvestments);

module.exports = router;