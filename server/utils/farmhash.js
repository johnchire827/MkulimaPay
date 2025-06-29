const farmhash = require('farmhash');

// Generate location hash for proximity searches
module.exports.generateLocationHash = (latitude, longitude, precision = 7) => {
  const lat = parseFloat(latitude).toFixed(6);
  const lon = parseFloat(longitude).toFixed(6);
  return farmhash.hash32(`${lat},${lon}`.substring(0, precision));
};

// Find nearby farms using geohash
module.exports.findNearbyFarms = async (latitude, longitude, radiusKm = 10) => {
  const { Farmer } = require('../models');
  
  return Farmer.findAll({
    where: sequelize.where(
      sequelize.fn(
        'ST_DWithin',
        sequelize.col('location'),
        sequelize.fn('ST_MakePoint', longitude, latitude),
        radiusKm * 1000
      ),
      true
    )
  });
};