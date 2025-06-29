const express = require('express');
const router = express.Router();
const db = require('../../../models');

router.get('/model-check', async (req, res) => {
  try {
    const response = {
      sequelize: typeof db.sequelize,
      define: typeof db.sequelize.define,
      Product: typeof db.Product,
      User: typeof db.User,
      modelsLoaded: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize')
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});

module.exports = router;