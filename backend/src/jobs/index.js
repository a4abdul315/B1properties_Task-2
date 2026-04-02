const logger = require('../utils/logger');
const { registerInsightRefreshJob } = require('./insightRefreshJob');
const { registerAlertSweepJob } = require('./alertSweepJob');
const { registerAlertEvaluationJob } = require('./alertEvaluationJob');
const { registerIngestionJobs } = require('./ingestionJob');

exports.startJobs = () => {
  registerInsightRefreshJob();
  registerAlertSweepJob();
  registerAlertEvaluationJob();
  registerIngestionJobs();
  logger.info('Background jobs registered');
};
