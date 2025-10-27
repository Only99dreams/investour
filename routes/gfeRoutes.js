const express = require('express');
const router = express.Router();
const gfeController = require('../controllers/gfeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.use(authMiddleware.protect);
router.get('/overview', gfeController.getGFEOverview);
router.get('/referral-tracking', gfeController.getReferralTracking);
router.get('/wallet', gfeController.getGFEWallet);
router.post('/withdrawal', gfeController.requestGFEWithdrawal);
router.get('/tools', gfeController.getGFETools);
router.get('/leaderboard', gfeController.getGFELeaderboard);
router.get('/user-activity', gfeController.getGFEUserActivity);
router.get('/support', gfeController.getGFESupport);
router.get('/sdg-tracker', gfeController.getGFESDGTracker);

module.exports = router;