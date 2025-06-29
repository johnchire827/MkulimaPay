const { Review, Product, User } = require('../models');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Validate input
    if (!productId || !rating) {
      return res.status(400).json({ 
        error: 'Product ID and rating are required' 
      });
    }
    
    // Get product with reviews
    const product = await Product.findByPk(productId, {
      include: [{
        model: Review,
        as: 'reviews'
      }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      where: {
        productId,
        userId: req.user.id
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this product' 
      });
    }
    
    // Create review
    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      comment: comment || '',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Update product rating
    await product.updateRating();
    
    // Get updated product with associations
    const updatedProduct = await Product.findByPk(productId, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'avatar', 'location']
        },
        {
          model: Review,
          as: 'reviews',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ]
    });
    
    res.status(201).json(updatedProduct);
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create review',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch reviews',
      details: error.message
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check ownership
    if (review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update review
    await review.update({
      rating: req.body.rating || review.rating,
      comment: req.body.comment || review.comment,
      updated_at: new Date()
    });
    
    // Update product rating
    const product = await Product.findByPk(review.productId);
    if (product) {
      await product.updateRating();
    }
    
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      error: 'Failed to update review',
      details: error.message
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check ownership
    if (review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const productId = review.productId;
    await review.destroy();
    
    // Update product rating
    const product = await Product.findByPk(productId);
    if (product) {
      await product.updateRating();
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      error: 'Failed to delete review',
      details: error.message
    });
  }
};