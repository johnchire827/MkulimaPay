const db = require('../models');

exports.createInstoreSale = async (req, res) => {
  try {
    const { productId, quantity, paymentMethod } = req.body;
    const farmerId = req.user.id;

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const amount = product.price * quantity;

    const sale = await db.InstoreSale.create({
      farmer_id: farmerId,
      product_id: productId,
      quantity,
      amount,
      payment_method: paymentMethod
    });

    product.quantity -= quantity;
    await product.save();

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating instore sale:', error);
    res.status(500).json({ error: 'Failed to record sale', message: error.message });
  }
};

exports.getFarmerInstoreSales = async (req, res) => {
  try {
    const farmerId = parseInt(req.params.farmerId, 10);
    const sales = await db.InstoreSale.findAll({
      where: { farmer_id: farmerId },
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'image_url']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(sales);
  } catch (error) {
    console.error('Error fetching instore sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales', message: error.message });
  }
};
