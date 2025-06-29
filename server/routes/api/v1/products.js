const express = require('express');
const router = express.Router();
const db = require('../../../models');

// Debugging: Log available models
console.log('Available models in products route:', Object.keys(db));

router.get('/', async (req, res) => {
  try {
    // Check if Product model exists
    if (!db.Product) {
      const errorMsg = 'Product model not registered!';
      console.error(errorMsg);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: errorMsg,
        availableModels: Object.keys(db)
      });
    }
    
    const products = await db.Product.findAll({
      include: [
        {
          model: db.User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone_number', 'location']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;