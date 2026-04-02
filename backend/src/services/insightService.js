const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const PriceHistory = require('../models/PriceHistory');
const SocialMention = require('../models/SocialMention');

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const getWindowStartDate = (days = 30) => {
  const safeDays = Math.max(Number(days) || 30, 1);
  const date = new Date();
  date.setDate(date.getDate() - safeDays);
  return date;
};

const normalizeGrouping = (groupBy) => {
  return ['day', 'week', 'month'].includes(groupBy) ? groupBy : 'day';
};

const buildTimeBucket = (fieldPath, groupBy) => {
  const formatByGrouping = {
    day: '%Y-%m-%d',
    week: '%Y-W%V',
    month: '%Y-%m',
  };

  return {
    $dateToString: {
      format: formatByGrouping[groupBy],
      date: fieldPath,
    },
  };
};

const buildListingMatchStage = (filters = {}) => {
  const match = {
    'deduplication.duplicateOf': null,
  };

  if (filters.area) {
    match.area = String(filters.area).trim().toLowerCase();
  }

  if (filters.category) {
    match.category = String(filters.category).trim().toLowerCase();
  }

  const competitorId = toObjectId(filters.competitor);
  if (competitorId) {
    match.competitor = competitorId;
  }

  if (filters.status) {
    match.status = filters.status;
  }

  return match;
};

const buildPriceHistoryMatchStage = (filters = {}) => {
  const match = {
    'source.observedAt': { $gte: getWindowStartDate(filters.days) },
  };

  const competitorId = toObjectId(filters.competitor);
  if (competitorId) {
    match.competitor = competitorId;
  }

  return match;
};

const buildSocialMentionMatchStage = (filters = {}) => {
  const match = {
    'deduplication.duplicateOf': null,
    'source.publishedAt': { $gte: getWindowStartDate(filters.days) },
  };

  const competitorId = toObjectId(filters.competitor);
  if (competitorId) {
    match.competitor = competitorId;
  }

  return match;
};

exports.getOverview = async (filters = {}) => {
  const match = buildListingMatchStage(filters);

  const [summary] = await Listing.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalListings: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        activeListings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalListings: 1,
        averagePrice: { $round: ['$averagePrice', 2] },
        activeListings: 1,
      },
    },
  ]);

  return summary || {
    totalListings: 0,
    averagePrice: 0,
    activeListings: 0,
  };
};

exports.getPriceTrends = async (filters = {}) => {
  const groupBy = normalizeGrouping(filters.groupBy);
  const priceMatch = buildPriceHistoryMatchStage(filters);

  const pipeline = [
    { $match: priceMatch },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listing',
        pipeline: [
          {
            $project: {
              area: 1,
              category: 1,
              title: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$listing' },
  ];

  if (filters.area || filters.category) {
    const listingFilter = {};

    if (filters.area) {
      listingFilter['listing.area'] = String(filters.area).trim().toLowerCase();
    }

    if (filters.category) {
      listingFilter['listing.category'] = String(filters.category).trim().toLowerCase();
    }

    pipeline.push({ $match: listingFilter });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          bucket: buildTimeBucket('$source.observedAt', groupBy),
          area: '$listing.area',
          category: '$listing.category',
        },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        sampleSize: { $sum: 1 },
        priceChangeAverage: { $avg: '$changePercent' },
      },
    },
    {
      $project: {
        _id: 0,
        x: '$_id.bucket',
        area: '$_id.area',
        category: '$_id.category',
        avgPrice: { $round: ['$averagePrice', 2] },
        minPrice: { $round: ['$minPrice', 2] },
        maxPrice: { $round: ['$maxPrice', 2] },
        avgChangePercent: { $round: ['$priceChangeAverage', 2] },
        sampleSize: 1,
      },
    },
    { $sort: { x: 1, area: 1, category: 1 } }
  );

  const series = await PriceHistory.aggregate(pipeline);

  return {
    metric: 'price-tracker',
    groupBy,
    windowDays: Number(filters.days) || 30,
    filters: {
      area: filters.area || null,
      category: filters.category || null,
      competitor: filters.competitor || null,
    },
    series,
  };
};

exports.getListingVelocity = async (filters = {}) => {
  const groupBy = normalizeGrouping(filters.groupBy);
  const match = buildListingMatchStage(filters);
  const dateField = filters.dateField === 'createdAt' ? '$createdAt' : '$source.firstSeenAt';

  match[dateField.replace('$', '')] = {
    $gte: getWindowStartDate(filters.days),
  };

  const series = await Listing.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          bucket: buildTimeBucket(dateField, groupBy),
          area: '$area',
          category: '$category',
          competitor: '$competitor',
        },
        newListings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'competitors',
        localField: '_id.competitor',
        foreignField: '_id',
        as: 'competitor',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $project: {
        _id: 0,
        x: '$_id.bucket',
        area: '$_id.area',
        category: '$_id.category',
        competitorId: '$_id.competitor',
        competitor: {
          $ifNull: [{ $arrayElemAt: ['$competitor.name', 0] }, 'Unknown competitor'],
        },
        newListings: 1,
      },
    },
    { $sort: { x: 1, competitor: 1 } },
  ]);

  const totals = await Listing.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalNewListings: { $sum: 1 },
        activeListings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalNewListings: 1,
        activeListings: 1,
      },
    },
  ]);

  return {
    metric: 'listing-velocity',
    groupBy,
    windowDays: Number(filters.days) || 30,
    filters: {
      area: filters.area || null,
      category: filters.category || null,
      competitor: filters.competitor || null,
    },
    summary: totals[0] || {
      totalNewListings: 0,
      activeListings: 0,
    },
    series,
  };
};

exports.getMarketHeatIndex = async (filters = {}) => {
  const listingMatch = buildListingMatchStage(filters);
  listingMatch.createdAt = { $gte: getWindowStartDate(filters.days) };

  const socialMatch = buildSocialMentionMatchStage(filters);

  const listingMetrics = await Listing.aggregate([
    { $match: listingMatch },
    {
      $group: {
        _id: '$area',
        listingVolume: { $sum: 1 },
        activeListings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const priceFluctuations = await PriceHistory.aggregate([
    { $match: buildPriceHistoryMatchStage(filters) },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listing',
        pipeline: [{ $project: { area: 1, category: 1 } }],
      },
    },
    { $unwind: '$listing' },
    ...(filters.area ? [{ $match: { 'listing.area': String(filters.area).trim().toLowerCase() } }] : []),
    ...(filters.category
      ? [{ $match: { 'listing.category': String(filters.category).trim().toLowerCase() } }]
      : []),
    {
      $group: {
        _id: '$listing.area',
        averagePriceChange: { $avg: { $abs: '$changePercent' } },
      },
    },
  ]);

  const socialMetrics = await SocialMention.aggregate([
    { $match: socialMatch },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listing',
        pipeline: [{ $project: { area: 1, category: 1 } }],
      },
    },
    {
      $addFields: {
        derivedArea: {
          $ifNull: [{ $arrayElemAt: ['$listing.area', 0] }, 'unknown'],
        },
      },
    },
    ...(filters.area ? [{ $match: { derivedArea: String(filters.area).trim().toLowerCase() } }] : []),
    {
      $group: {
        _id: '$derivedArea',
        socialMentions: { $sum: 1 },
        engagementScore: {
          $sum: {
            $add: ['$engagement.likes', '$engagement.comments', '$engagement.shares'],
          },
        },
      },
    },
  ]);

  const priceByArea = new Map(priceFluctuations.map((item) => [item._id, item.averagePriceChange || 0]));
  const socialByArea = new Map(
    socialMetrics.map((item) => [
      item._id,
      {
        socialMentions: item.socialMentions || 0,
        engagementScore: item.engagementScore || 0,
      },
    ])
  );

  const heatMap = listingMetrics.map((item) => {
    const priceFluctuation = Number((priceByArea.get(item._id) || 0).toFixed(2));
    const social = socialByArea.get(item._id) || { socialMentions: 0, engagementScore: 0 };
    const heatIndex = Number(
      (
        item.listingVolume * 0.45 +
        priceFluctuation * 0.35 +
        social.socialMentions * 0.15 +
        social.engagementScore * 0.05
      ).toFixed(2)
    );

    return {
      area: item._id,
      listingVolume: item.listingVolume,
      activeListings: item.activeListings,
      priceFluctuation,
      socialMentions: social.socialMentions,
      engagementScore: social.engagementScore,
      heatIndex,
      trend: heatIndex >= 75 ? 'hot' : heatIndex >= 35 ? 'warm' : 'cool',
    };
  });

  heatMap.sort((left, right) => right.heatIndex - left.heatIndex);

  return {
    metric: 'market-heat-index',
    windowDays: Number(filters.days) || 30,
    filters: {
      area: filters.area || null,
      category: filters.category || null,
      competitor: filters.competitor || null,
    },
    summary: {
      totalAreas: heatMap.length,
      hottestArea: heatMap[0]?.area || null,
      highestHeatIndex: heatMap[0]?.heatIndex || 0,
    },
    series: heatMap,
  };
};
