const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  balance: {
    type: Number,
    default: 0
  },
  gemPoints: {
    type: Number,
    default: 0
  },
  gfeBalance: {
    type: Number,
    default: 0
  },
  withdrawalMethod: {
    type: String,
    enum: ['bank', 'wallet', 'atm'],
    default: 'bank'
  },
  bankAccount: {
    accountNumber: {
      type: String,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    accountHolder: {
      type: String,
      default: ''
    }
  },
  withdrawalRequests: [{
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required']
    },
    method: {
      type: String,
      enum: ['bank', 'wallet', 'atm'],
      required: [true, 'Withdrawal method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'successful', 'failed'],
      default: 'pending'
    },
    reason: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  transactions: [{
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required']
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: [true, 'Transaction type is required']
    },
    narration: {
      type: String,
      required: [true, 'Narration is required']
    },
    source: {
      type: String,
      enum: ['investment', 'referral', 'bonus', 'gem_points', 'withdrawal'],
      required: [true, 'Source is required']
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel'
    },
    relatedModel: {
      type: String,
      enum: ['Investment', 'Referral', 'Bonus', 'GemPoints', 'Withdrawal']
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

module.exports = mongoose.model('Wallet', walletSchema);