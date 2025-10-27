const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referrer is required']
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referred user is required']
  },
  referralCode: {
    type: String,
    required: [true, 'Referral code is required']
  },
  level: {
    type: Number,
    enum: [1, 2],
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date
  },
  isSubAffiliate: {
    type: Boolean,
    default: false
  },
  earnings: [{
    amount: {
      type: Number,
      required: [true, 'Earning amount is required']
    },
    type: {
      type: String,
      enum: ['direct_subscriber', 'direct_investor', 'indirect_subscriber', 'indirect_investor', 'bonus'],
      required: [true, 'Earning type is required']
    },
    narration: {
      type: String,
      required: [true, 'Narration is required']
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Referral', referralSchema);