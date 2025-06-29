const db = require('../models');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get base URL from environment or use localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Store only the filename, not full path
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      unit: req.body.unit,
      category: req.body.category,
      location: req.body.location,
      origin: req.body.origin || null,
      organic: req.body.organic === 'true' || req.body.organic === true,
      farmerId: req.user.id,
      imageUrl: imagePath,  // Store relative path only
      quantity: req.body.quantity ? parseInt(req.body.quantity, 10) : 1 // ADDED QUANTITY HANDLING
    };
    
    const product = await db.Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    console.log('Fetching products...');
    const products = await db.Product.findAll({
      include: [
        { 
          model: db.User, 
          as: 'farmer',
          attributes: ['id', 'name', 'phone_number', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Found ${products.length} products`);
    
    // Construct full image URLs
    const plainProducts = products.map(p => {
      const imageUrl = p.imageUrl ? `${BASE_URL}${p.imageUrl}` : null;
      
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        unit: p.unit,
        category: p.category,
        location: p.location,
        origin: p.origin,
        organic: p.organic,
        quantity: p.quantity,  // FIXED: Use actual quantity from DB
        imageUrl,  // Now contains full URL
        rating: p.rating,
        reviewCount: p.reviewCount,
        currentStage: p.currentStage,
        blockchainVerified: p.blockchainVerified,
        blockchainTxHash: p.blockchainTxHash,
        created_at: p.created_at,
        updated_at: p.updated_at,
        farmer: p.farmer ? {
          id: p.farmer.id,
          name: p.farmer.name,
          phone_number: p.farmer.phone_number,
          avatar: p.farmer.avatar
        } : null
      };
    });
    
    res.json(plainProducts);
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack
      } : undefined
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id, {
      include: [
        { 
          model: db.User, 
          as: 'farmer',
          attributes: ['id', 'name', 'phone_number', 'email', 'avatar', 'location']
        },
        {
          model: db.Review,
          as: 'reviews',
          include: [{
            model: db.User,
            as: 'user',
            attributes: ['id', 'name', 'avatar']
          }]
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Construct full image URL
    const imageUrl = product.imageUrl ? `${BASE_URL}${product.imageUrl}` : null;
    
    // Convert to plain object
    const plainProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      location: product.location,
      origin: product.origin,
      organic: product.organic,
      quantity: product.quantity,  // ADDED QUANTITY FIELD
      imageUrl,  // Now contains full URL
      rating: product.rating,
      reviewCount: product.reviewCount,
      currentStage: product.currentStage,
      blockchainVerified: product.blockchainVerified,
      blockchainTxHash: product.blockchainTxHash,
      created_at: product.created_at,
      updated_at: product.updated_at,
      farmer: product.farmer ? {
        id: product.farmer.id,
        name: product.farmer.name,
        phone_number: product.farmer.phone_number,
        email: product.farmer.email,
        avatar: product.farmer.avatar,
        location: product.farmer.location
      } : null,
      reviews: product.reviews ? product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: review.user ? {
          id: review.user.id,
          name: review.user.name,
          avatar: review.user.avatar
        } : null
      })) : []
    };
    
    res.json(plainProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Find the product
    const product = await db.Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user is the owner
    if (product.farmerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this product' });
    }

    // Update fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = parseFloat(req.body.price);
    if (req.body.unit) product.unit = req.body.unit;
    if (req.body.category) product.category = req.body.category;
    if (req.body.location) product.location = req.body.location;
    if (req.body.origin) product.origin = req.body.origin;
    if (req.body.organic !== undefined) {
      product.organic = req.body.organic === 'true' || req.body.organic === true;
    }
    // ADDED QUANTITY UPDATE
    if (req.body.quantity !== undefined) {
      product.quantity = parseInt(req.body.quantity, 10) || 1;
    }
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (product.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../..', product.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new image path
      product.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Find the product
    const product = await db.Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user is the owner
    if (product.farmerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    // Delete associated reviews first to avoid foreign key constraint
    await db.Review.destroy({
      where: { productId: productId }
    });

    // Delete associated image file if exists
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '../../..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the product
    await product.destroy();
    
    res.json({ 
      message: 'Product deleted successfully',
      id: productId
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message
    });
  }
};