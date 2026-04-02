const Redis = require('ioredis');

const config = require('./config');
const logger = require('./logger');

let redis;
let redisAvailable = false;

const getRedisClient = () => {
  if (!config.redisEnabled) {
    return null;
  }

  if (!redis) {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Redis connection established');
    });

    redis.on('ready', () => {
      redisAvailable = true;
    });

    redis.on('error', (error) => {
      redisAvailable = false;
      logger.warn(`Redis connection issue: ${error.message}`);
    });

    redis.on('close', () => {
      redisAvailable = false;
    });
  }

  return redis;
};

exports.connectRedis = async () => {
  const client = getRedisClient();

  if (!client) {
    logger.info('Redis disabled by configuration');
    return null;
  }

  try {
    if (client.status !== 'ready') {
      await client.connect();
    }

    redisAvailable = client.status === 'ready';
    return redisAvailable ? client : null;
  } catch (error) {
    redisAvailable = false;
    logger.warn(`Redis unavailable, continuing without Redis features: ${error.message}`);
    return null;
  }
};

exports.getRedisClient = getRedisClient;
exports.isRedisAvailable = () => redisAvailable;
