const cron = require('node-cron');

const Alert = require('../models/Alert');
const logger = require('../utils/logger');

exports.registerAlertSweepJob = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const unreadCount = await Alert.countDocuments({ isRead: false });
      logger.info(`Alert sweep job completed. Unread alerts: ${unreadCount}`);
    } catch (error) {
      logger.error(`Alert sweep job failed: ${error.message}`);
    }
  });
};
