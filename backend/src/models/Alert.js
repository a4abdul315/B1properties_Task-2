const crypto = require('crypto');
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['price_drop', 'new_listing', 'velocity_spike', 'heat_index_change', 'social_spike', 'system'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    source: {
      type: {
        type: String,
        enum: ['system', 'listing_site', 'news_api', 'social_api', 'manual'],
        required: true,
      },
      platform: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'system',
      },
      externalId: {
        type: String,
        trim: true,
        default: null,
      },
      generatedAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    competitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competitor',
      default: null,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
      index: true,
    },
    socialMention: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialMention',
      default: null,
      index: true,
    },
    priceHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PriceHistory',
      default: null,
      index: true,
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
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
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

alertSchema.pre('validate', function setDeduplication(next) {
  const exactBase = [
    this.type,
    this.source?.platform || '',
    this.source?.externalId || '',
    this.listing?.toString() || '',
    this.socialMention?.toString() || '',
  ].join('|');
  const fingerprintBase = [this.type, this.title?.toLowerCase() || '', this.severity].join('|');

  this.deduplication = this.deduplication || {};
  this.deduplication.exactKey = crypto.createHash('sha1').update(exactBase).digest('hex');
  this.deduplication.fingerprint = crypto.createHash('sha1').update(fingerprintBase).digest('hex');

  next();
});

alertSchema.index({ severity: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ competitor: 1, type: 1, createdAt: -1 });
alertSchema.index({ listing: 1, type: 1, createdAt: -1 });
alertSchema.index(
  { 'source.platform': 1, 'source.externalId': 1, type: 1 },
  { sparse: true, name: 'idx_alert_source_lookup' }
);

module.exports = mongoose.model('Alert', alertSchema);
