const delay = require('./delay');

module.exports = async (operation, options = {}) => {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const onRetry = options.onRetry ?? (() => {});

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= retries) {
        break;
      }

      await onRetry(error, attempt);
      await delay(baseDelayMs * attempt);
    }
  }

  throw lastError;
};
