const express = require('express');
const router = express.Router();

// Example M-Pesa payment simulation
router.post('/mpesa', async (req, res) => {
  const { orderId, phone, amount } = req.body;

  if (!orderId || !phone || !amount) {
    return res.status(400).json({ error: 'Missing orderId, phone, or amount' });
  }

  // Simulate M-Pesa payment logic
  console.log(`Initiating M-Pesa payment for order ${orderId} to phone ${phone} for amount ${amount}`);

  // You can integrate with real M-Pesa here using Daraja API

  res.json({
    message: 'M-Pesa payment initiated',
    orderId,
    phone,
    amount
  });
});

module.exports = router;
