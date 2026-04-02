const cacheService = require('../utils/cacheService');

module.exports = (namespace, ttlSeconds) => {
  return async (req, res, next) => {
    const key = cacheService.buildCacheKey(namespace, req);
    const cached = await cacheService.get(key);

    if (cached) {
      return res.status(200).json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      await cacheService.set(key, body, ttlSeconds);
      return originalJson(body);
    };

    return next();
  };
};
