const config = require('../utils/config');
const { getRedisClient, isRedisAvailable } = require('../utils/redisClient');

exports.getQueueConnection = () => {
  if (!config.queueEnabled || !isRedisAvailable()) {
    return null;
  }

  return getRedisClient();
};
