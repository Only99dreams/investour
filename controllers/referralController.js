// controllers/referralController.js
const Referral = require('../models/Referral');
const User = require('../models/User');
const GFE = require('../models/GFE');

exports.trackReferralClick = async (req, res) => {
  try {
    const { refCode } = req.query;
    if (!refCode) return res.status(400).json({ success: false, message: 'Referral code required' });
    
    const referrer = await User.findOne({ referralCode: refCode });
    if (!referrer) return res.status(404).json({ success: false, message: 'Invalid referral code' });
    
    // Update GFE click-throughs
    let gfe = await GFE.findOne({ user: referrer._id });
    if (gfe) {
      gfe.clickThroughs += 1;
      await gfe.save();
    }
    
    res.status(200).json({ success: true, message: 'Referral tracked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track referral', error: error.message });
  }
};

exports.getReferralPerformance = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id })
      .populate('referredUser', 'fullName email')
      .sort({ joinedAt: -1 });
    
    res.status(200).json({ success: true, referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch referral data', error: error.message });
  }
};