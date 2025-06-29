const db = require('../models');

exports.getFarmerProducts = async (req, res) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10); // also ensure it's a number

    const products = await db.Product.findAll({
      where: { farmer_id: farmerId }, // ✅ Use correct DB column
      attributes: [
        'id',
        'name',
        'price',
        'unit',
        'category',
        'imageUrl',
        'rating',
        'quantity',
        'organic',
        'location'

         // ✅ Add this to fix your UI
  ]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update getFarmerStats function
exports.getFarmerStats = async (req, res) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);

    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      instoreSalesTotal,
      averageRating,
      pendingOrders,
      pendingBids
    ] = await Promise.all([
      db.Product.count({ where: { farmer_id: farmerId } }),

      db.Order.count({ where: { farmer_id: farmerId } }),

      db.Order.sum('total_amount', {
        where: { farmer_id: farmerId }
      }).then(val => val || 0),

      db.InstoreSale.sum('amount', {
        where: { farmer_id: farmerId }
      }).then(val => val || 0),

      db.Product.findOne({
        where: { farmer_id: farmerId },
        attributes: [
          [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating']
        ],
        raw: true
      }).then(result => result ? parseFloat(result.avgRating || 0).toFixed(1) : 0),

      db.Order.count({
        where: {
          farmer_id: farmerId,
          status: 'pending'
        }
      }),

      // ✅ FIXED: Count pending bids by joining Bid with Product (which has farmer_id)
      db.Bid.count({
        include: [{
          model: db.Product,
          as: 'bid_product',
          where: { farmer_id: farmerId }
        }],
        where: { status: 'pending' }
      })
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      instoreSalesTotal,
      averageRating,
      pendingOrders,
      pendingBids
    });
  } catch (error) {
    console.error('Error fetching farmer stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
};


exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);
    const orders = await db.Order.findAll({
      where: { farmer_id: farmerId },
      attributes: [
        'id', 
        'total_amount', 
        'status', 
        'user_id', 
        'created_at', 
        'updated_at', 
        'shipping_address', 
        'payment_method'
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
exports.getFarmerReviews = async (req, res) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);

    const reviews = await db.Review.findAll({
      include: [
        {
          model: db.Product,
          as: 'product',
          where: { farmer_id: farmerId },
          attributes: ['id', 'name', 'imageUrl']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching farmer reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
  }
};
