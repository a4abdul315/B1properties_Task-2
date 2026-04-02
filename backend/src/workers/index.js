const { Worker } = require('bullmq');

const queueNames = require('../queues/names');
const { getQueueConnection } = require('../queues/connection');
const logger = require('../utils/logger');
const config = require('../utils/config');
const {
  runCompetitorScraping,
  runNewsIngestion,
  runSocialSimulation,
} = require('../services/ingestion/ingestionOrchestrator');
const {
  evaluateListingSpikeAlerts,
  evaluateMarketHeatAlerts,
} = require('../services/alertRuleEngine');

const connection = getQueueConnection();

if (!config.queueEnabled || !connection) {
  logger.info('Queue workers are disabled');
  process.exit(0);
}

new Worker(
  queueNames.ingestionQueueName,
  async (job) => {
    if (job.name === 'competitor-scrape') {
      return runCompetitorScraping();
    }

    if (job.name === 'news-ingestion') {
      return runNewsIngestion();
    }

    if (job.name === 'social-simulation') {
      return runSocialSimulation();
    }

    return null;
  },
  {
    connection,
    prefix: queueNames.prefix,
  }
);

new Worker(
  queueNames.alertQueueName,
  async (job) => {
    if (job.name === 'evaluate-listing-spike') {
      return evaluateListingSpikeAlerts();
    }

    if (job.name === 'evaluate-market-heat') {
      return evaluateMarketHeatAlerts();
    }

    return null;
  },
  {
    connection,
    prefix: queueNames.prefix,
  }
);

logger.info('BullMQ workers started');
