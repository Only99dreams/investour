// controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, location, attachments = [] } = req.body;
    
    const post = new Post({
      title,
      content,
      category,
      author: req.user.id,
      authorModel: req.user.userType.charAt(0).toUpperCase() + req.user.userType.slice(1),
      location,
      attachments,
      isApproved: req.user.userType === 'admin' ? true : false
    });
    
    await post.save();
    res.status(201).json({ success: true, message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { isApproved: true };
    if (category) filter.category = category;
    
    const posts = await Post.find(filter)
      .populate('author', 'fullName groupName firmName')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }
    res.status(200).json({ success: true, likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like post', error: error.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.shares += 1;
    await post.save();
    res.status(200).json({ success: true, shares: post.shares });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to share post', error: error.message });
  }
};