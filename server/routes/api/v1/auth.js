const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const authMiddleware = require('../../../middleware/auth');

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

router.put(
  '/change-password',
  authMiddleware.authenticateUser,
  authController.changePassword
);

module.exports = router;