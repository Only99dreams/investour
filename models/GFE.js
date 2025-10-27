const mongoose = require('mongoose');

const gfeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  gemPoints: {
    type: Number,
    default: 0
  },
  lifetimeReferredUsers: {
    type: Number,
    default: 0
  },
  totalSubAffiliates: {
    type: Number,
    default: 0
  },
  totalSubAffiliateEarnings: {
    type: Number,
    default: 0
  },
  activeUsersLast30Days: {
    type: Number,
    default: 0
  },
  impact: {
    type: Object,
    default: {
      peopleEducated: 0,
      groupsOnboarded: 0,
      communitiesReached: 0,
      sdgGoals: []
    }
  },
  referralLink: {
    type: String,
    required: [true, 'Referral link is required']
  },
  qrCode: {
    type: String,
    default: ''
  },
  clickThroughs: {
    type: Number,
    default: 0
  },
  signUps: {
    type: Number,
    default: 0
  },
  verifiedUsers: {
    type: Number,
    default: 0
  },
  subscribedUsers: {
    type: Number,
    default: 0
  },
  investingUsers: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  earningsBreakdown: {
    onboardingBonus: {
      type: Number,
      default: 0
    },
    directSubscribers: {
      type: Number,
      default: 0
    },
    directInvestors: {
      type: Number,
      default: 0
    },
    indirectSubscribers: {
      type: Number,
      default: 0
    },
    indirectInvestors: {
      type: Number,
      default: 0
    },
    bonuses: {
      type: Number,
      default: 0
    }
  },
  pendingEarnings: {
    type: Number,
    default: 0
  },
  paidEarnings: {
    type: Number,
    default: 0
  },
  withdrawalThreshold: {
    type: Number,
    default: 5000
  },
  withdrawalFeePercentage: {
    type: Number,
    default: 15
  },
  withdrawalSchedule: {
    type: String,
    default: 'within_72_hours'
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

module.exports = mongoose.model('GFE', gfeSchema);