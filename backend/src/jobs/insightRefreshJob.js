const cron = require('node-cron');

const logger = require('../utils/logger');

exports.registerInsightRefreshJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Insight refresh job triggered');
  });
};
