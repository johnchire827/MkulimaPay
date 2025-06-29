const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.json({ message: 'USSD endpoint' });
});

module.exports = router;