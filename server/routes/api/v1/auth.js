const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const authMiddleware = require('../../../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Password change route
router.put(
  '/change-password',
  authMiddleware.authenticateUser,
  authController.changePassword
);

module.exports = router;