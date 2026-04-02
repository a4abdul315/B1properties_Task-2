const { createLogger, format, transports } = require('winston');

const config = require('./config');

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}] ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
