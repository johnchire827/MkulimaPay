const express = require('express');
const router = express.Router();
const bidController = require('../../../controllers/bidController');
const auth = require('../../../middleware/auth');

// Unified bid query endpoint
router.get('/', async (req, res) => {
  try {
    const buyerId = req.query.buyer_id;
    const farmerId = req.query.farmer_id;
    
    if (buyerId) {
      return bidController.getBidsByBuyer(req, res);
    } 
    else if (farmerId) {
      return bidController.getFarmerBids(req, res);
    }
    
    return res.status(400).json({ error: 'Missing buyer_id or farmer_id in query' });
  } catch (error) {
    console.error('Bid query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Create new bid
router.post('/', 
  auth.authenticateUser,
  bidController.createBid
);

// GET - Bids for a specific product
router.get('/product/:productId', 
  bidController.getProductBids
);

// GET - Bids for a farmer's products
router.get('/farmer/:farmerId', 
  auth.authenticateUser,
  bidController.getFarmerBids
);

// PATCH - Update bid status
router.patch('/:bidId/status', 
  auth.authenticateUser,
  bidController.updateBidStatus
);

module.exports = router;