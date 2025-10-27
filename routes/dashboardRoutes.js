const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.use(authMiddleware.protect);
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/profile', dashboardController.getUserProfile);
router.patch('/profile', dashboardController.updateUserProfile);
router.get('/settings', dashboardController.getSettings);
router.patch('/settings', dashboardController.updateSettings);

module.exports = router;