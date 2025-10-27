// controllers/advertisementController.js
const Advertisement = require('../models/Advertisement');
const User = require('../models/User');
const Group = require('../models/Group');
const Firm = require('../models/Firm');

exports.createAdvertisement = async (req, res) => {
  try {
    const { title, description, media, targetAudience, duration, paymentMethod, paymentAmount } = req.body;
    
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const ad = new Advertisement({
      title,
      description,
      media,
      targetAudience,
      duration,
      startDate,
      endDate,
      status: 'draft',
      advertiser: req.user.id,
      advertiserModel: req.user.userType.charAt(0).toUpperCase() + req.user.userType.slice(1),
      paymentMethod,
      paymentAmount,
      paymentStatus: 'pending'
    });
    
    await ad.save();
    res.status(201).json({ success: true, message: 'Advertisement created', advertisement: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create ad', error: error.message });
  }
};

exports.getAdvertisements = async (req, res) => {
  try {
    const activeAds = await Advertisement.find({ 
      status: 'active', 
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, advertisements: activeAds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ads', error: error.message });
  }
};

exports.getMyAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find({ advertiser: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, advertisements: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your ads', error: error.message });
  }
};

exports.updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.advertiser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    Object.assign(ad, req.body);
    await ad.save();
    res.status(200).json({ success: true, advertisement: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ad', error: error.message });
  }
};

exports.deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.advertiser.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await ad.remove();
    res.status(200).json({ success: true, message: 'Advertisement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete ad', error: error.message });
  }
};