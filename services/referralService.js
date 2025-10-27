// services/referralService.js
const Referral = require('../models/Referral');
const GFE = require('../models/GFE');
const Wallet = require('../models/Wallet');

exports.createReferral = async (referrerId, referredId, level = 1) => {
  const referral = new Referral({
    referrer: referrerId,
    referredUser: referredId,
    level,
    status: 'active',
    joinedAt: new Date()
  });
  await referral.save();
  return referral;
};

exports.calculateCommission = (type, amount, userTier = 'Free') => {
  const rates = {
    Free: { directSubscriber: 0.30, directInvestor: 0.40, indirectSubscriber: 0.10, indirectInvestor: 0.05 },
    Premium: { directSubscriber: 0.35, directInvestor: 0.45, indirectSubscriber: 0.12, indirectInvestor: 0.06 },
    Exclusive: { directSubscriber: 0.40, directInvestor: 0.50, indirectSubscriber: 0.15, indirectInvestor: 0.08 }
  };
  
  return amount * (rates[userTier]?.[type] || 0);
};