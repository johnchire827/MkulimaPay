const express = require('express');
const router = express.Router();

router.post('/process', (req, res) => {
  res.json({ message: 'Payment processing endpoint' });
});

module.exports = router;
