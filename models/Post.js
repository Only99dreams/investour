const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  category: {
    type: String,
    enum: ['Education', 'Finance', 'Climate', 'Investment', 'Advert', 'Scam Alert', 'Announcement'],
    required: [true, 'Category is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'authorModel',
    required: [true, 'Author is required']
  },
  authorModel: {
    type: String,
    enum: ['User', 'Group', 'Firm', 'Admin'],
    required: [true, 'Author model is required']
  },
  location: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  attachments: [{
    type: String,
    default: ''
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  scheduledAt: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'admin_only'],
    default: 'public'
  },
  meta: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);