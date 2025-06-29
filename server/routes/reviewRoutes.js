const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth'); // Fixed import

// Create review
router.post(
  '/',
  auth.authenticateUser,
  reviewController.createReview
);

// Get reviews for a product
router.get(
  '/product/:productId',
  reviewController.getProductReviews
);

// Update review
router.put(
  '/:id',
  auth.authenticateUser,
  reviewController.updateReview
);

// Delete review
router.delete(
  '/:id',
  auth.authenticateUser,
  reviewController.deleteReview
);

module.exports = router;