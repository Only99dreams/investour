const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route (anonymous users can search)
router.post('/search', aiController.aiSearch);

// Protected route (requires login to analyze)
router.use(authMiddleware.protect);
router.post('/analyze', aiController.aiAnalyze);
router.get('/history', aiController.getAIHistory);

module.exports = router;