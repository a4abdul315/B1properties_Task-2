const { StatusCodes } = require('http-status-codes');

const listingService = require('../services/listingService');
const asyncHandler = require('../utils/asyncHandler');

exports.getListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getListings(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    data: listings,
  });
});

exports.getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: listing,
  });
});

exports.createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: listing,
  });
});

exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    data: listing,
  });
});
