const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const productVerificationCtrl = require('../controllers/productVerification');

router.post('/analyze', upload.single('image'), productVerificationCtrl.analyzeProductImage);

module.exports = router;