const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connection handling
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

module.exports = { redis: redisClient };