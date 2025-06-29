const express = require('express');
const router = express.Router();
const db = require('../../../models');
const { Op } = require('sequelize');


// GET orders by user ID
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id in query' });
    }

    const orders = await db.Order.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// POST - Create new order (updated to handle multiple items with quantities)
router.post('/', async (req, res) => {
  try {
    const { userId, items, total, shippingAddress, paymentMethod,contact } = req.body;

    // Validate required fields
    if (!userId || !items || !total || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, items, total, shippingAddress, paymentMethod' 
      });
    }

    // Find farmer_id from the first product
    const firstProduct = await db.Product.findByPk(items[0].id);
    if (!firstProduct) {
      return res.status(400).json({ error: 'First product not found' });
    }

    // Create order
    const newOrder = await db.Order.create({
      total_amount: total,
      status: 'pending',
      user_id: userId,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      farmer_id: firstProduct.farmerId,  // CRITICAL ADDITION
      contact  // 👈 Add this line
    });

    // Create order items with quantities
    const orderItems = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    await db.OrderProduct.bulkCreate(orderItems);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: newOrder.id,
        total: newOrder.total_amount,
        status: newOrder.status
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// GET order by ID (updated to include quantities)
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await db.Order.findByPk(orderId, {
      include: [
        {
          model: db.Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        },
        {
          model: db.User,
          as: 'farmer',
          attributes: ['id', 'name', 'email', 'phone_number']
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone_number']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format response with quantities
    const formattedOrder = {
      id: order.id,
      total: order.total_amount,
      status: order.status,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      products: order.products.map(product => ({
        id: product.id,
        name: product.name,
       price: product.OrderProduct.price,      
        quantity: product.OrderProduct.quantity, 
        unit: product.unit,
        imageUrl: product.imageUrl
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET orders for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    const orders = await db.Order.findAll({
      where: { farmer_id: farmerId },
      attributes: ['id', 'total_amount', 'status', 'user_id', 'created_at', 'shipping_address', 'payment_method'],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['name', 'phone_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// UPDATE ORDER STATUS
router.patch('/:orderId/status', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    const userId = req.user?.id;

    // Validate status input
    const validStatus = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Valid values are: pending, processing, completed, cancelled' 
      });
    }

    // Find the order
    const order = await db.Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Authorization check
    if (userId && userId !== order.farmer_id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this order' });
    }

    // Update order status
    await order.update({ 
      status: status,
      updated_at: new Date()
    });

    res.json({
      id: order.id,
      status: order.status,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

module.exports = router;

