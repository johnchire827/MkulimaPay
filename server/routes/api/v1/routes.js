const express = require('express');
const router = express.Router(); // You missed this line
const agoraController = require('../controllers/agoraController');


// Route to generate RTC token
router.get('/agora/token', agoraController.generateRTCToken);

module.exports = router;
