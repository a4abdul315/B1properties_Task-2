const Competitor = require('../models/Competitor');
const AppError = require('../utils/AppError');

exports.getCompetitors = async (filters = {}) => {
  const query = {};

  if (filters.category) {
    query.categories = filters.category;
  }

  if (filters.area) {
    query.trackedAreas = filters.area;
  }

  return Competitor.find(query).sort({ createdAt: -1 });
};

exports.getCompetitorById = async (id) => {
  const competitor = await Competitor.findById(id);

  if (!competitor) {
    throw new AppError('Competitor not found', 404);
  }

  return competitor;
};

exports.createCompetitor = async (payload) => {
  return Competitor.create(payload);
};

exports.updateCompetitor = async (id, payload) => {
  const competitor = await Competitor.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!competitor) {
    throw new AppError('Competitor not found', 404);
  }

  return competitor;
};
