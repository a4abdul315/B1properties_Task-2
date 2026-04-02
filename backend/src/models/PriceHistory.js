const crypto = require('crypto');
const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    competitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competitor',
      required: true,
      index: true,
    },
    source: {
      type: {
        type: String,
        enum: ['listing_site', 'news_api', 'social_api', 'manual'],
        required: true,
      },
      platform: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
      },
      externalId: {
        type: String,
        trim: true,
        default: null,
      },
      observedAt: {
        type: Date,
        required: true,
        index: true,
      },
    },
    previousPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    previousPriceInMinor: {
      type: Number,
      min: 0,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceInMinor: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    currency: {
      type: String,
      default: 'AED',
      trim: true,
      uppercase: true,
    },
    changeAmount: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    deduplication: {
      exactKey: {
        type: String,
        trim: true,
        index: true,
      },
      fingerprint: {
        type: String,
        trim: true,
        index: true,
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

priceHistorySchema.pre('validate', function normalize(next) {
  this.priceInMinor = typeof this.price === 'number' ? Math.round(this.price * 100) : this.priceInMinor;
  this.previousPriceInMinor =
    typeof this.previousPrice === 'number' ? Math.round(this.previousPrice * 100) : this.previousPriceInMinor;
  this.changeAmount =
    typeof this.previousPrice === 'number' ? Number((this.price - this.previousPrice).toFixed(2)) : 0;
  this.changePercent =
    typeof this.previousPrice === 'number' && this.previousPrice !== 0
      ? Number((((this.price - this.previousPrice) / this.previousPrice) * 100).toFixed(2))
      : 0;

  const exactBase = [
    this.listing?.toString() || '',
    this.source?.platform || '',
    this.source?.externalId || '',
    this.source?.observedAt?.toISOString() || '',
  ].join('|');
  const fingerprintBase = [
    this.listing?.toString() || '',
    this.priceInMinor || '',
    this.currency || '',
    this.source?.observedAt?.toISOString() || '',
  ].join('|');

  this.deduplication = this.deduplication || {};
  this.deduplication.exactKey = crypto.createHash('sha1').update(exactBase).digest('hex');
  this.deduplication.fingerprint = crypto.createHash('sha1').update(fingerprintBase).digest('hex');

  next();
});

priceHistorySchema.index(
  { listing: 1, 'source.observedAt': -1 },
  { name: 'idx_price_history_listing_observed' }
);
priceHistorySchema.index(
  { competitor: 1, 'source.observedAt': -1 },
  { name: 'idx_price_history_competitor_observed' }
);
priceHistorySchema.index(
  { 'source.platform': 1, 'source.externalId': 1, 'source.observedAt': 1 },
  { sparse: true, name: 'idx_price_history_source_observed' }
);

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
