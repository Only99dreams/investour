// routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const advertisementController = require('../controllers/advertisementController');

router.use(authMiddleware.protect);

router.post('/', advertisementController.createAdvertisement);
router.get('/', advertisementController.getAdvertisements);
router.get('/my', advertisementController.getMyAdvertisements);
router.patch('/:id', advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);

module.exports = router;