const logger = require('../utils/logger');
const queueNames = require('./names');
const { createQueue } = require('./queueFactory');

const queue = createQueue(queueNames.ingestionQueueName);

exports.enqueueIngestionJob = async (jobName, payload = {}) => {
  if (!queue) {
    return false;
  }

  await queue.add(jobName, payload, {
    jobId: `${jobName}:${Date.now()}`,
  });
  logger.info(`Queued ingestion job ${jobName}`);
  return true;
};
