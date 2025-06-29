const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController');

router.get('/:userId/balance', userController.getUserBalance);

module.exports = router;
