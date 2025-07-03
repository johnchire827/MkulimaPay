const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Error handling
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('✅ Redis client connected');
    } catch (err) {
      console.error('❌ Redis connection failed:', err.message);
      throw err;
    }
  }
}

module.exports = { redis: redisClient, connectRedis };
