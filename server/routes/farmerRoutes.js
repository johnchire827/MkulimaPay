const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
router.get('/:farmerId/reviews', farmerController.getFarmerReviews);


// GET farmer's products
router.get('/:farmerId/products', farmerController.getFarmerProducts);

// GET farmer's stats
router.get('/:farmerId/stats', farmerController.getFarmerStats);

// GET farmer's orders
router.get('/:farmerId/orders', farmerController.getFarmerOrders);

module.exports = router;