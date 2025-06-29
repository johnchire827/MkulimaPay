const express = require('express');
const router = express.Router();
const supplyChainController = require('../controllers/supplyChainController');
const fileUpload = require('../utils/fileUpload');

// Get supply chain data for a product
router.get('/:productId', supplyChainController.getSupplyChainData);

// Update product stage
router.post(
  '/:productId/update',
  fileUpload.single('image'),
  supplyChainController.updateProductStage
);

// NEW: Save journey to database
router.post('/:productId/journey', supplyChainController.saveJourney);

module.exports = router;