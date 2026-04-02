const cron = require('node-cron');

const config = require('../utils/config');
const logger = require('../utils/logger');
const { enqueueAlertJob } = require('../queues/alertQueue');
const {
  evaluateListingSpikeAlerts,
  evaluateMarketHeatAlerts,
} = require('../services/alertRuleEngine');

exports.registerAlertEvaluationJob = () => {
  cron.schedule(config.alertEvaluationSchedule, async () => {
    try {
      const queuedSpike = await enqueueAlertJob('evaluate-listing-spike');
      const queuedHeat = await enqueueAlertJob('evaluate-market-heat');

      if (!queuedSpike) {
        await evaluateListingSpikeAlerts();
      }

      if (!queuedHeat) {
        await evaluateMarketHeatAlerts();
      }

      logger.info('Alert evaluation job completed');
    } catch (error) {
      logger.error(`Alert evaluation job failed: ${error.message}`);
    }
  });
};
