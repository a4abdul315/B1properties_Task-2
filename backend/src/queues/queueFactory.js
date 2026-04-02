const { Queue } = require('bullmq');

const { getQueueConnection } = require('./connection');
const queueNames = require('./names');

exports.createQueue = (queueName) => {
  const connection = getQueueConnection();

  if (!connection) {
    return null;
  }

  return new Queue(queueName, {
    connection,
    prefix: queueNames.prefix,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
};
