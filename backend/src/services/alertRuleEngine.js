const Alert = require('../models/Alert');
const Competitor = require('../models/Competitor');
const Listing = require('../models/Listing');
const config = require('../utils/config');
const insightService = require('./insightService');
const { publishAlertCreated } = require('./alertPublisher');

const createAlertIfMissing = async ({
  type,
  title,
  message,
  severity,
  competitor = null,
  listing = null,
  priceHistory = null,
  metadata = {},
  sourceExternalId,
}) => {
  const existing = await Alert.findOne({
    type,
    competitor,
    listing,
    priceHistory,
    isRead: false,
    'source.platform': 'rule-engine',
    'source.externalId': sourceExternalId,
  });

  if (existing) {
    return existing;
  }

  const alert = await Alert.create({
    type,
    title,
    message,
    severity,
    source: {
      type: 'system',
      platform: 'rule-engine',
      externalId: sourceExternalId,
      generatedAt: new Date(),
    },
    competitor,
    listing,
    priceHistory,
    metadata,
  });

  publishAlertCreated(alert);
  return alert;
};

exports.evaluatePriceDropAlert = async ({ listing, competitor, priceHistory }) => {
  const dropPercent = Math.abs(priceHistory.changePercent || 0);
  const isDrop = (priceHistory.changeAmount || 0) < 0;

  if (!isDrop || dropPercent < config.alertPriceDropThreshold) {
    return null;
  }

  return createAlertIfMissing({
    type: 'price_drop',
    title: `Price dropped ${dropPercent}% for ${listing.title}`,
    message: `${competitor.name} reduced the listing price in ${listing.area} from ${priceHistory.previousPrice} to ${priceHistory.price}.`,
    severity: dropPercent >= config.alertPriceDropThreshold * 2 ? 'high' : 'medium',
    competitor: competitor._id,
    listing: listing._id,
    priceHistory: priceHistory._id,
    metadata: {
      threshold: config.alertPriceDropThreshold,
      dropPercent,
      area: listing.area,
      category: listing.category,
    },
    sourceExternalId: `price-drop-${priceHistory._id}`,
  });
};

exports.evaluateListingSpikeAlerts = async () => {
  const now = new Date();
  const currentWindowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const previousWindowStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const counts = await Listing.aggregate([
    {
      $match: {
        createdAt: { $gte: currentWindowStart },
        'deduplication.duplicateOf': null,
      },
    },
    {
      $group: {
        _id: '$competitor',
        currentCount: { $sum: 1 },
      },
    },
  ]);

  for (const entry of counts) {
    const competitor = await Competitor.findById(entry._id);

    if (!competitor) {
      continue;
    }

    const previousCount = await Listing.countDocuments({
      competitor: competitor._id,
      createdAt: { $gte: previousWindowStart, $lt: currentWindowStart },
      'deduplication.duplicateOf': null,
    });

    const spikeAmount = entry.currentCount - previousCount;

    if (spikeAmount < config.alertListingSpikeThreshold) {
      continue;
    }

    await createAlertIfMissing({
      type: 'velocity_spike',
      title: `Listing spike detected for ${competitor.name}`,
      message: `${competitor.name} posted ${entry.currentCount} new listings in the last 24 hours, ${spikeAmount} more than the previous window.`,
      severity: spikeAmount >= config.alertListingSpikeThreshold * 2 ? 'high' : 'medium',
      competitor: competitor._id,
      metadata: {
        threshold: config.alertListingSpikeThreshold,
        currentCount: entry.currentCount,
        previousCount,
        spikeAmount,
      },
      sourceExternalId: `velocity-spike-${competitor._id}-${currentWindowStart.toISOString().slice(0, 10)}`,
    });
  }
};

exports.evaluateMarketHeatAlerts = async () => {
  const heatData = await insightService.getMarketHeatIndex({ days: 30 });

  for (const entry of heatData.series || []) {
    if (entry.heatIndex < config.alertHeatIndexThreshold) {
      continue;
    }

    await createAlertIfMissing({
      type: 'heat_index_change',
      title: `High market heat in ${entry.area}`,
      message: `${entry.area} reached a heat index of ${entry.heatIndex} driven by ${entry.listingVolume} listings and ${entry.socialMentions} social mentions.`,
      severity: entry.heatIndex >= config.alertHeatIndexThreshold + 20 ? 'critical' : 'high',
      metadata: {
        threshold: config.alertHeatIndexThreshold,
        area: entry.area,
        heatIndex: entry.heatIndex,
        listingVolume: entry.listingVolume,
        socialMentions: entry.socialMentions,
      },
      sourceExternalId: `heat-index-${entry.area}-${new Date().toISOString().slice(0, 10)}`,
    });
  }
};
