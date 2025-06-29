const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const { 
  createProduct, 
  getAllProducts,
  getProductById
} = require('../controllers/productController');
const { authenticateUser, authorizeFarmer } = require('../middleware/auth');

// Create new product (Farmer only)
router.post(
  '/', 
  authenticateUser, 
  authorizeFarmer,
  upload.single('image'),
  createProduct
);

// Get all products
router.get('/', getAllProducts);

// Get single product
router.get('/:id', getProductById);

module.exports = router;