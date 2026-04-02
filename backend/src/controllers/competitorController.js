const { StatusCodes } = require('http-status-codes');

const competitorService = require('../services/competitorService');
const asyncHandler = require('../utils/asyncHandler');

exports.getCompetitors = asyncHandler(async (req, res) => {
  const competitors = await competitorService.getCompetitors(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: competitors,
  });
});

exports.getCompetitorById = asyncHandler(async (req, res) => {
  const competitor = await competitorService.getCompetitorById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: competitor,
  });
});

exports.createCompetitor = asyncHandler(async (req, res) => {
  const competitor = await competitorService.createCompetitor(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: competitor,
  });
});

exports.updateCompetitor = asyncHandler(async (req, res) => {
  const competitor = await competitorService.updateCompetitor(req.params.id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data: competitor,
  });
});
