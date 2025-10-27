// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// Public
router.get('/', postController.getPosts);

// Protected
router.use(authMiddleware.protect);
router.post('/', postController.createPost);
router.post('/:id/like', postController.likePost);
router.post('/:id/share', postController.sharePost);

module.exports = router;