const express = require('express');
const router = express.Router();
const transactionController = require('../../../controllers/transactionController');

router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.get('/user/:userId', transactionController.getUserTransactions);
router.post('/callback', transactionController.handleCallback); // Add callback endpoint

module.exports = router;