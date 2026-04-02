const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');

const config = require('./utils/config');
const { apiLimiter } = require('./utils/rateLimiter');
const logger = require('./utils/logger');
const routes = require('./routes');
const notFoundHandler = require('./utils/notFoundHandler');
const errorHandler = require('./utils/errorHandler');

const app = express();

client.collectDefaultMetrics();

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    next(error);
  }
});

app.use(config.apiPrefix, routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
