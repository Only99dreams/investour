// controllers/firmController.js
const Firm = require('../models/Firm');
const Investment = require('../models/Investment');

exports.getFirmDashboard = async (req, res) => {
  try {
    const firm = await Firm.findById(req.user.id);
    if (!firm) return res.status(404).json({ success: false, message: 'Firm not found' });

    const investments = await Investment.find({ firm: firm._id });
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalGain = investments.reduce((sum, inv) => sum + inv.totalGain, 0);

    res.status(200).json({
      success: true,
      firm: {
        id: firm._id,
        firmName: firm.firmName,
        sector: firm.sector,
        countryOfRegistration: firm.countryOfRegistration,
        verificationStatus: firm.verificationStatus,
        isVerified: firm.isVerified
      },
      investments: investments.length,
      totalInvested,
      totalGain,
      staffAccounts: firm.staffAccounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load firm dashboard', error: error.message });
  }
};

exports.submitInvestment = async (req, res) => {
  try {
    const firm = await Firm.findById(req.user.id);
    if (!firm || firm.verificationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Firm not approved' });
    }

    const investment = new Investment({
      ...req.body,
      firm: firm._id,
      status: 'pending'
    });

    await investment.save();
    res.status(201).json({ success: true, message: 'Investment submitted for vetting', investment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit investment', error: error.message });
  }
};

exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ firm: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, investments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch investments', error: error.message });
  }
};