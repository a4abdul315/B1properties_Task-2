const { StatusCodes } = require('http-status-codes');

const alertService = require('../services/alertService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertService.getAlerts(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: alerts,
  });
});

exports.createAlertRule = asyncHandler(async (req, res) => {
  const alert = await alertService.createAlert(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: alert,
  });
});

exports.markAlertAsRead = asyncHandler(async (req, res) => {
  const alert = await alertService.markAlertAsRead(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: alert,
  });
});
