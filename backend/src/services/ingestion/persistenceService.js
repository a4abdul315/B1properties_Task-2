const Competitor = require('../../models/Competitor');
const Listing = require('../../models/Listing');
const PriceHistory = require('../../models/PriceHistory');
const SocialMention = require('../../models/SocialMention');
const Alert = require('../../models/Alert');
const logger = require('../../utils/logger');
const { upsertListing, upsertMention } = require('./deduplicationService');
const { evaluatePriceDropAlert } = require('../alertRuleEngine');
const {
  normalizeListing,
  normalizeNewsMention,
  normalizeSocialMention,
} = require('./normalizationService');

const ensureCompetitor = async (sourceConfig) => {
  const normalizedName = sourceConfig.name.trim().toLowerCase();
  let competitor = await Competitor.findOne({ normalizedName });

  if (!competitor) {
    competitor = await Competitor.create({
      name: sourceConfig.name,
      website: sourceConfig.website,
      categories: sourceConfig.categories || [],
      trackedAreas: sourceConfig.trackedAreas || [],
      sourceIdentities: [
        {
          platform: sourceConfig.name.toLowerCase().replace(/\s+/g, '-'),
          externalId: sourceConfig.website,
          profileUrl: sourceConfig.website,
        },
      ],
    });
  }

  return competitor;
};

exports.persistListingBatch = async (sourceConfig, records) => {
  const competitor = await ensureCompetitor(sourceConfig);
  const savedListings = [];

  for (const record of records) {
    const normalized = normalizeListing(
      {
        ...record,
        platform: sourceConfig.name.toLowerCase().replace(/\s+/g, '-'),
      },
      competitor._id
    );

    const existing = await Listing.findOne({
      competitor: competitor._id,
      'source.platform': normalized.source.platform,
      'source.externalId': normalized.source.externalId,
    });

    const savedListing = await upsertListing(normalized);
    savedListings.push(savedListing);

    if (!existing || existing.price !== savedListing.price) {
      const priceHistory = await PriceHistory.create({
        listing: savedListing._id,
        competitor: competitor._id,
        source: {
          type: 'listing_site',
          platform: normalized.source.platform,
          externalId: normalized.source.externalId,
          observedAt: normalized.source.collectedAt,
        },
        previousPrice: existing ? existing.price : null,
        price: savedListing.price,
        currency: savedListing.currency,
      });

      if (existing) {
        await evaluatePriceDropAlert({
          listing: savedListing,
          competitor,
          priceHistory,
        });
      }
    }
  }

  logger.info(`Persisted ${savedListings.length} listings for ${sourceConfig.name}`);
  return savedListings;
};

exports.persistNewsBatch = async (articles, competitor = null) => {
  const savedMentions = [];

  for (const article of articles) {
    const normalized = normalizeNewsMention(article, competitor?._id || null);
    const savedMention = await upsertMention(SocialMention, normalized);
    savedMentions.push(savedMention);
  }

  logger.info(`Persisted ${savedMentions.length} news mentions`);
  return savedMentions;
};

exports.persistSocialBatch = async (mentions, competitor = null, listing = null) => {
  const savedMentions = [];

  for (const mention of mentions) {
    const normalized = normalizeSocialMention(mention, competitor?._id || null, listing?._id || null);
    const savedMention = await upsertMention(SocialMention, normalized);
    savedMentions.push(savedMention);

    if ((normalized.engagement.likes || 0) + (normalized.engagement.comments || 0) > 120) {
      await Alert.create({
        type: 'social_spike',
        title: `Social spike detected for ${competitor ? competitor.name : 'market activity'}`,
        message: normalized.content,
        severity: 'medium',
        source: {
          type: 'social_api',
          platform: normalized.source.platform,
          externalId: normalized.source.externalId,
          generatedAt: new Date(),
        },
        competitor: competitor?._id || null,
        listing: listing?._id || null,
        socialMention: savedMention._id,
        metadata: {
          engagement: normalized.engagement,
        },
      });
    }
  }

  logger.info(`Persisted ${savedMentions.length} social mentions`);
  return savedMentions;
};
