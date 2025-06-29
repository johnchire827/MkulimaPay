const express = require('express');
const router = express.Router({ strict: false });
const upload = require('../../../utils/fileUpload');
const productController = require('../../../controllers/productController'); 
const auth = require('../../../middleware/auth');

// CREATE
router.post(
  '/', 
  auth.authenticateUser,
  auth.authorizeFarmer,
  upload.single('image'),
  productController.createProduct
);

// READ
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// UPDATE
router.patch(
  '/:id', 
  auth.authenticateUser,
  auth.authorizeFarmer,
  upload.single('image'),
  productController.updateProduct
);

// DELETE
router.delete(
  '/:id', 
  auth.authenticateUser,
  auth.authorizeFarmer,
  productController.deleteProduct
);

module.exports = router;