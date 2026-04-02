const cron = require('node-cron');

const config = require('../utils/config');
const logger = require('../utils/logger');
const retry = require('../utils/retry');
const { enqueueIngestionJob } = require('../queues/ingestionQueue');
const {
  runCompetitorScraping,
  runNewsIngestion,
  runSocialSimulation,
} = require('../services/ingestion/ingestionOrchestrator');

const wrapScheduledJob = (jobName, handler) => {
  return async () => {
    logger.info(`${jobName} started`);

    try {
      await retry(() => handler(), {
        retries: config.ingestionRetryAttempts,
        baseDelayMs: config.ingestionRetryDelayMs,
        onRetry: async (error, attempt) => {
          logger.warn(`${jobName} retry ${attempt} failed: ${error.message}`);
        },
      });
      logger.info(`${jobName} completed`);
    } catch (error) {
      logger.error(`${jobName} failed after retries: ${error.message}`);
    }
  };
};

exports.registerIngestionJobs = () => {
  cron.schedule(config.competitorScrapeSchedule, async () => {
    const queued = await enqueueIngestionJob('competitor-scrape');
    if (!queued) {
      await wrapScheduledJob('competitor-scrape-job', runCompetitorScraping)();
    }
  });
  cron.schedule(config.newsIngestionSchedule, async () => {
    const queued = await enqueueIngestionJob('news-ingestion');
    if (!queued) {
      await wrapScheduledJob('news-ingestion-job', runNewsIngestion)();
    }
  });
  cron.schedule(config.socialSimulationSchedule, async () => {
    const queued = await enqueueIngestionJob('social-simulation');
    if (!queued) {
      await wrapScheduledJob('social-simulation-job', runSocialSimulation)();
    }
  });
};
