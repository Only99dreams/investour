const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Investment title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Agric', 'Energy', 'Real Estate', 'Tech', 'Other'],
    required: [true, 'Category is required']
  },
  minimumAmount: {
    type: Number,
    required: [true, 'Minimum amount is required'],
    min: [1, 'Minimum amount must be at least 1']
  },
  expectedROI: {
    type: Number,
    required: [true, 'Expected ROI is required'],
    min: [0, 'ROI cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  paymentFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Annually', 'One-time'],
    required: [true, 'Payment frequency is required']
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: [true, 'Risk level is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  documents: [{
    type: String,
    default: ''
  }],
  media: [{
    type: String,
    default: ''
  }],
  sdgAlignment: [{
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  }],
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: [true, 'Firm is required']
  },
  status: {
    type: String,
    enum: ['pending', 'paused', 'flagged', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  investments: {
    type: Number,
    default: 0
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  totalGain: {
    type: Number,
    default: 0
  },
  aiVettingResult: {
    type: Object,
    default: {}
  },
  internalNotes: {
    type: String,
    default: ''
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

module.exports = mongoose.model('Investment', investmentSchema);