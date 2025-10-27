// controllers/investmentController.js
const Investment = require('../models/Investment');
const User = require('../models/User');

exports.getVettedInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ status: 'approved' })
      .populate('firm', 'firmName sector')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, investments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch investments', error: error.message });
  }
};

exports.investInOpportunity = async (req, res) => {
  try {
    const { investmentId, amount } = req.body;
    const investment = await Investment.findById(investmentId);
    
    if (!investment || investment.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Invalid or unapproved investment' });
    }
    
    if (amount < investment.minimumAmount) {
      return res.status(400).json({ success: false, message: `Minimum investment is ${investment.minimumAmount}` });
    }
    
    // In real app: deduct from user wallet, record transaction
    investment.investments += 1;
    investment.totalInvested += amount;
    await investment.save();
    
    res.status(200).json({ success: true, message: 'Investment recorded', investmentId, amount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Investment failed', error: error.message });
  }
};