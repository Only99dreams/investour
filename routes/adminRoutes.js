const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protected routes with admin role check
router.use(authMiddleware.protect);
router.use(roleMiddleware.restrictTo('admin', 'super_admin'));

router.get('/dashboard-overview', adminController.getAdminDashboardOverview);
router.get('/users', adminController.getUserManagement);
router.post('/users/:id/manage', adminController.manageUser);
router.get('/posts', adminController.getPostManagement);
router.post('/posts/:id/manage', adminController.managePost);
router.get('/investments', adminController.getInvestmentManagement);
router.post('/investments/:id/manage', adminController.manageInvestment);
router.get('/firms', adminController.getFirmManagement);
router.post('/firms/:id/manage', adminController.manageFirm);
router.get('/advertisements', adminController.getAdvertisementManagement);
router.post('/advertisements/:id/manage', adminController.manageAdvertisement);
router.get('/gfe', adminController.getGFEManagement);
router.post('/gfe/:id/manage', adminController.manageGFE);
router.get('/referral-funnel', adminController.getReferralFunnelAnalytics);
router.get('/campaigns', adminController.getCampaignManagement);
router.post('/campaigns/:id/manage', adminController.manageCampaign);
router.get('/leaderboard', adminController.getLeaderboardManagement);
router.post('/leaderboard/manage', adminController.manageLeaderboard);

module.exports = router;