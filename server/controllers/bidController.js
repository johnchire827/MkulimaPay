const { Bid, Product, User, Order, OrderProduct } = require('../models');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// Helper function to generate initials
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper function to format image URLs
const formatImageUrl = (url) => {
  if (!url) return null;
  
  // Handle Windows paths
  if (url.includes('\\')) {
    const fileName = url.split('\\').pop();
    return `${BASE_URL}/uploads/${fileName}`;
  }
  
  // Handle relative paths
  if (url.startsWith('/uploads/')) {
    return `${BASE_URL}${url}`;
  }
  
  // Handle filenames only
  if (!url.includes('/') && url.includes('.')) {
    return `${BASE_URL}/uploads/${url}`;
  }
  
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

exports.createBid = async (req, res) => {
  try {
    const { productId, amount, message, shippingAddress, paymentMethod } = req.body;
    const buyerId = req.user.id;

    if (!productId || !amount || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Product ID, amount, shipping address, and payment method are required' 
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate bid amount > current price
    if (parseFloat(amount) <= parseFloat(product.price)) {
      return res.status(400).json({ 
        error: `Bid amount must be greater than current price (KES ${product.price})`
      });
    }

    const bid = await Bid.create({
      product_id: productId,
      buyer_id: buyerId,
      amount,
      message,
      shipping_address: shippingAddress,
      payment_method: paymentMethod
    });

    const newBid = await Bid.findByPk(bid.id, {
      include: [
        {
          model: User,
          as: 'bid_buyer',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: Product,
          as: 'bid_product',
          attributes: ['id', 'name', 'price', 'image_url']
        }
      ]
    });

    res.status(201).json(newBid);
  } catch (error) {
    console.error('Bid creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create bid',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getProductBids = async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { product_id: req.params.productId },
      include: [
        {
          model: User,
          as: 'bid_buyer',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Product,
          as: 'bid_product',
          attributes: ['id', 'name', 'price', 'image_url']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format images and avatars
    const formattedBids = bids.map(bid => ({
      ...bid.get({ plain: true }),
      bid_buyer: {
        ...bid.bid_buyer.get({ plain: true }),
        avatar: bid.bid_buyer.avatar 
          ? bid.bid_buyer.avatar.startsWith('http') 
            ? bid.bid_buyer.avatar 
            : `${BASE_URL}${bid.bid_buyer.avatar}`
          : getInitials(bid.bid_buyer.name)
      },
      bid_product: {
        ...bid.bid_product.get({ plain: true }),
        image_url: formatImageUrl(bid.bid_product.image_url)
      }
    }));
    
    res.json(formattedBids);
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bids',
      details: error.message
    });
  }
};

exports.getFarmerBids = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;
    
    const products = await Product.findAll({
      where: { farmer_id: farmerId },
      attributes: ['id']
    });
    
    const productIds = products.map(p => p.id);
    
    const bids = await Bid.findAll({
      where: { product_id: productIds },
      include: [
        {
          model: Product,
          as: 'bid_product',
          attributes: ['id', 'name', 'image_url', 'category', 'price']
        },
        {
          model: User,
          as: 'bid_buyer',
          attributes: ['id', 'name', 'avatar', 'location']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const formattedBids = bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      created_at: bid.created_at,
      buyer_id: bid.buyer_id,
      buyer_name: bid.bid_buyer.name,
      buyer_avatar: bid.bid_buyer.avatar 
        ? bid.bid_buyer.avatar.startsWith('http') 
          ? bid.bid_buyer.avatar 
          : `${BASE_URL}${bid.bid_buyer.avatar}`
        : getInitials(bid.bid_buyer.name),
      buyer_location: bid.bid_buyer.location,
      product_id: bid.product_id,
      product_name: bid.bid_product.name,
      product_price: bid.bid_product.price, // Added for validation
      product_image: formatImageUrl(bid.bid_product.image_url),
      product_category: bid.bid_product.category,
      message: bid.message, // Added for UI display
      shipping_address: bid.shipping_address,
      payment_method: bid.payment_method
    }));
    
    res.json(formattedBids);
  } catch (error) {
    console.error('Get farmer bids error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch farmer bids',
      details: error.message
    });
  }
};

// Other controller methods remain unchanged...

exports.getBidsByBuyer = async (req, res) => {
  try {
    const buyerId = req.query.buyer_id;

    if (!buyerId) {
      return res.status(400).json({ error: 'Missing buyer_id in query' });
    }

    const bids = await Bid.findAll({
      where: { buyer_id: buyerId },
      include: [
        {
          model: Product,
          as: 'bid_product',
          attributes: ['id', 'name', 'image_url', 'category']
        },
        {
          model: User,
          as: 'bid_buyer',
          attributes: ['id', 'name', 'avatar', 'location']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedBids = bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      created_at: bid.created_at,
      buyer_id: bid.buyer_id,
      buyer_name: bid.bid_buyer.name,
      buyer_avatar: bid.bid_buyer.avatar 
        ? bid.bid_buyer.avatar.startsWith('http') 
          ? bid.bid_buyer.avatar 
          : `${BASE_URL}${bid.bid_buyer.avatar}`
        : getInitials(bid.bid_buyer.name),
      buyer_location: bid.bid_buyer.location,
      product_id: bid.product_id,
      product_name: bid.bid_product.name,
      product_image: formatImageUrl(bid.bid_product.image_url),
      product_category: bid.bid_product.category,
      message: bid.message,
      shipping_address: bid.shipping_address,
      payment_method: bid.payment_method
    }));

    res.json(formattedBids);
  } catch (error) {
    console.error('Error fetching buyer bids:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};

exports.updateBidStatus = async (req, res) => {
  const { bidId } = req.params;
  const { status } = req.body;
  const t = await Bid.sequelize.transaction();

  try {
    const bid = await Bid.findByPk(bidId, {
      include: [
        {
          model: Product,
          as: 'bid_product',
          include: [
            {
              model: User,
              as: 'farmer',
              attributes: ['id']
            }
          ]
        },
        {
          model: User,
          as: 'bid_buyer',
          attributes: ['id']
        }
      ],
      transaction: t
    });

    if (!bid) {
      await t.rollback();
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    if (req.user.id !== bid.bid_product.farmer.id) {
      await t.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    bid.status = status;
    await bid.save({ transaction: t });

    let order = null;
    if (status === 'accepted') {
      order = await Order.create({
        total_amount: bid.amount,
        status: 'pending',
        farmer_id: bid.bid_product.farmer.id,
        user_id: bid.bid_buyer.id,
        shipping_address: bid.shipping_address,
        payment_method: bid.payment_method,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });

      await OrderProduct.create({
        order_id: order.id,
        product_id: bid.product_id,
        quantity: 1,
        price: bid.amount,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });
    }

    await t.commit();
    
    res.json({ 
      message: 'Bid status updated',
      bid: {
        id: bid.id,
        status: bid.status
      },
      order
    });
  } catch (error) {
    await t.rollback();
    console.error('Bid status update error:', error);
    res.status(500).json({ 
      error: 'Failed to update bid status',
      details: error.message
    });
  }
};