const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ad title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ad description is required']
  },
  media: {
    type: String,
    required: [true, 'Ad media is required']
  },
  targetAudience: {
    gender: [{
      type: String,
      enum: ['Male', 'Female', 'Other', 'All']
    }],
    nationality: [{
      type: String
    }],
    region: [{
      type: String
    }],
    userTier: [{
      type: String,
      enum: ['Free', 'Premium', 'Exclusive', 'All']
    }]
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'advertiserModel',
    required: [true, 'Advertiser is required']
  },
  advertiserModel: {
    type: String,
    enum: ['User', 'Firm', 'External'],
    required: [true, 'Advertiser model is required']
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'wallet', 'credit_card'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  views: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  analytics: {
    type: Object,
    default: {}
  },
  sponsorTag: {
    type: String,
    default: ''
  },
  isSponsored: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Advertisement', advertisementSchema);