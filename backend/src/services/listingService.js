const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');

const buildListingQuery = (filters) => {
  const query = {};

  if (filters.area) {
    query.area = filters.area;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.competitor) {
    query.competitor = filters.competitor;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return query;
};

exports.getListings = async (filters = {}) => {
  return Listing.find(buildListingQuery(filters))
    .populate('competitor', 'name website')
    .sort({ createdAt: -1 });
};

exports.getListingById = async (id) => {
  const listing = await Listing.findById(id).populate('competitor', 'name website');

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  return listing;
};

exports.createListing = async (payload) => {
  return Listing.create(payload);
};

exports.updateListing = async (id, payload) => {
  const listing = await Listing.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  return listing;
};
