const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

const logger = require('./logger');

module.exports = (error, req, res, next) => {
  let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Something went wrong';
  let details = error.details || null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = 'Duplicate resource detected';
    details = error.keyValue;
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid resource identifier';
  }

  logger.error(`${req.method} ${req.originalUrl} -> ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};
