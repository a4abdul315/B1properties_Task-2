const config = require('../utils/config');

module.exports = {
  prefix: config.queuePrefix,
  ingestionQueueName: config.ingestionQueueName,
  alertQueueName: config.alertQueueName,
};
