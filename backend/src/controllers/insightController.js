const { StatusCodes } = require('http-status-codes');

const insightService = require('../services/insightService');
const asyncHandler = require('../utils/asyncHandler');

exports.getOverview = asyncHandler(async (req, res) => {
  const overview = await insightService.getOverview(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: overview,
  });
});

exports.getPriceTrends = asyncHandler(async (req, res) => {
  const trends = await insightService.getPriceTrends(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: trends,
  });
});

exports.getListingVelocity = asyncHandler(async (req, res) => {
  const velocity = await insightService.getListingVelocity(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: velocity,
  });
});

exports.getMarketHeatIndex = asyncHandler(async (req, res) => {
  const heatIndex = await insightService.getMarketHeatIndex(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: heatIndex,
  });
});
