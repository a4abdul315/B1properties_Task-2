const cron = require('node-cron');

const config = require('../utils/config');
const logger = require('../utils/logger');
const {
  evaluateListingSpikeAlerts,
  evaluateMarketHeatAlerts,
} = require('../services/alertRuleEngine');

exports.registerAlertEvaluationJob = () => {
  cron.schedule(config.alertEvaluationSchedule, async () => {
    try {
      await evaluateListingSpikeAlerts();
      await evaluateMarketHeatAlerts();
      logger.info('Alert evaluation job completed');
    } catch (error) {
      logger.error(`Alert evaluation job failed: ${error.message}`);
    }
  });
};
