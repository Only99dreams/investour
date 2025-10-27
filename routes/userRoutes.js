const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/individual/signup', userController.signupIndividual);
router.post('/group/signup', userController.signupGroup);
router.post('/firm/signup', userController.signupFirm);

// Protected routes
router.use(authMiddleware.protect);
router.patch('/individual/complete-profile', userController.completeProfileIndividual);
router.patch('/group/complete-profile', userController.completeProfileGroup);
router.patch('/firm/complete-profile', userController.completeProfileFirm);

module.exports = router;