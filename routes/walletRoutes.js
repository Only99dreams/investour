// routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const walletController = require('../controllers/walletController');

router.use(authMiddleware.protect);

router.get('/', walletController.getWallet);
router.post('/withdraw', walletController.requestWithdrawal);
router.get('/transactions', walletController.getTransactions);

module.exports = router;