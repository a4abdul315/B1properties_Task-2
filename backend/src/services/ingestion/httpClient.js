const axios = require('axios');

const config = require('../../utils/config');
const retry = require('../../utils/retry');
const logger = require('../../utils/logger');
const { requestHeaders } = require('./constants');

const randomHeaderSet = () => {
  return requestHeaders[Math.floor(Math.random() * requestHeaders.length)];
};

exports.get = async (url, options = {}) => {
  return retry(
    async (attempt) => {
      const response = await axios.get(url, {
        timeout: config.ingestionRequestTimeoutMs,
        headers: {
          ...randomHeaderSet(),
          ...(options.headers || {}),
        },
        params: options.params || {},
      });

      return response.data;
    },
    {
      retries: config.ingestionRetryAttempts,
      baseDelayMs: config.ingestionRetryDelayMs,
      onRetry: async (error, attempt) => {
        logger.warn(`Retrying request to ${url}. Attempt ${attempt}. Reason: ${error.message}`);
      },
    }
  );
};
