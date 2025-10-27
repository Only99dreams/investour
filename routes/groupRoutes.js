// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const groupController = require('../controllers/groupController');

router.use(authMiddleware.protect);

router.get('/dashboard', groupController.getGroupDashboard);

module.exports = router;