const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(500).json({ error: "Authentication failed" });
  }
};

exports.authenticate = exports.authenticateUser;

exports.authorizeFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer' && req.user.role !== 'both') {
    return res.status(403).json({ error: 'Farmer access required' });
  }
  next();
};

exports.authorizeBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer' && req.user.role !== 'both') {
    return res.status(403).json({ error: 'Buyer access required' });
  }
  next();
};

exports.authorizeOwner = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params[idParam]);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};
