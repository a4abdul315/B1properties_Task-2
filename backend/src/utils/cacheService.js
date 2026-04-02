const config = require('./config');
const { getRedisClient } = require('./redisClient');
const logger = require('./logger');

const prefix = 'cache:';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

exports.buildCacheKey = (namespace, req) => {
  const query = Object.entries(req.query || {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${prefix}${namespace}:${req.originalUrl.split('?')[0]}:${query}`;
};

exports.get = async (key) => {
  if (!config.cacheEnabled) {
    return null;
  }

  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    return null;
  }

  const value = await redis.get(key);
  return value ? safeParse(value) : null;
};

exports.set = async (key, value, ttlSeconds) => {
  if (!config.cacheEnabled) {
    return;
  }

  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    return;
  }

  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

exports.delByPattern = async (pattern) => {
  const redis = getRedisClient();
  if (!redis || redis.status !== 'ready') {
    return;
  }

  const keys = await redis.keys(`${prefix}${pattern}*`);

  if (keys.length > 0) {
    await redis.del(keys);
    logger.info(`Invalidated ${keys.length} cache keys for pattern ${pattern}`);
  }
};
