const { redis } = require('../../config/redis.config');

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Override res.json to cache responses
      const originalJson = res.json;
      res.json = (body) => {
        redis.setex(key, duration, JSON.stringify(body));
        originalJson.call(res, body);
      };
      
      next();
    } catch (error) {
      console.error('Redis error:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;