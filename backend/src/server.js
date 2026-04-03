const http = require('http');

const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');
const connectDatabase = require('./utils/database');
const { startJobs } = require('./jobs');
const { initializeSocketServer } = require('./realtime/socketServer');

const startServer = async () => {
  try {
    await connectDatabase();
    const httpServer = http.createServer(app);
    initializeSocketServer(httpServer, config.clientOrigin);
    startJobs();

    httpServer.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
