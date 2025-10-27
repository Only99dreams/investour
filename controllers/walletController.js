// controllers/walletController.js
const Wallet = require('../models/Wallet');
const User = require('../models/User');

exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user.id });
      await wallet.save();
    }
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet', error: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method = 'bank' } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }
    
    wallet.withdrawalRequests.push({
      amount,
      method,
      status: 'pending',
      createdAt: new Date()
    });
    
    wallet.balance -= amount;
    await wallet.save();
    
    res.status(200).json({ success: true, message: 'Withdrawal requested', request: wallet.withdrawalRequests[wallet.withdrawalRequests.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Withdrawal failed', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    res.status(200).json({ success: true, transactions: wallet?.transactions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};