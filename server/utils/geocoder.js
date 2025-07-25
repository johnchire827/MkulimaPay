const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;