const express = require('express');
const router = express.Router();
const instoreSaleController = require('../controllers/instoreSaleController');
const { authenticateUser } = require('../middleware/authMiddleware'); // ✅ use specific function

// Record instore sale
router.post('/', authenticateUser, instoreSaleController.createInstoreSale);

// Get instore sales for farmer
router.get('/farmer/:farmerId', authenticateUser, instoreSaleController.getFarmerInstoreSales);

module.exports = router;
