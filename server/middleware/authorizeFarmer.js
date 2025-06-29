module.exports = (req, res, next) => {
    console.log('AuthorizeFarmer middleware triggered');
    console.log('User role:', req.user.role);
    
    if (!['farmer', 'both'].includes(req.user.role)) {
      console.log('User is not a farmer');
      return res.status(403).json({ error: 'Farmer access required' });
    }
    
    console.log('User is authorized as farmer');
    next();
  };