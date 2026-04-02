const crypto = require('crypto');
const mongoose = require('mongoose');

const socialMentionSchema = new mongoose.Schema(
  {
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
    source: {
      type: {
        type: String,
        enum: ['social_api', 'news_api', 'manual'],
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
      externalUrl: {
        type: String,
        trim: true,
        default: null,
      },
      publishedAt: {
        type: Date,
        required: true,
        index: true,
      },
      collectedAt: {
        type: Date,
        default: Date.now,
      },
    },
    authorHandle: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedContent: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    sentiment: {
      score: {
        type: Number,
        min: -1,
        max: 1,
        default: 0,
      },
      label: {
        type: String,
        enum: ['negative', 'neutral', 'positive'],
        default: 'neutral',
      },
    },
    engagement: {
      likes: {
        type: Number,
        min: 0,
        default: 0,
      },
      comments: {
        type: Number,
        min: 0,
        default: 0,
      },
      shares: {
        type: Number,
        min: 0,
        default: 0,
      },
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
      duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialMention',
        default: null,
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

socialMentionSchema.pre('validate', function normalize(next) {
  this.normalizedContent = this.content ? this.content.trim().toLowerCase() : null;

  const exactBase = [
    this.source?.platform || '',
    this.source?.externalId || '',
    this.authorHandle || '',
  ].join('|');
  const fingerprintBase = [
    this.authorHandle || '',
    this.normalizedContent || '',
    this.source?.publishedAt?.toISOString() || '',
  ].join('|');

  this.deduplication = this.deduplication || {};
  this.deduplication.exactKey = crypto.createHash('sha1').update(exactBase).digest('hex');
  this.deduplication.fingerprint = crypto.createHash('sha1').update(fingerprintBase).digest('hex');

  next();
});

socialMentionSchema.index(
  { 'source.platform': 1, 'source.externalId': 1 },
  { sparse: true, name: 'idx_social_mention_source_identity' }
);
socialMentionSchema.index({ competitor: 1, 'source.publishedAt': -1 });
socialMentionSchema.index({ listing: 1, 'source.publishedAt': -1 });
socialMentionSchema.index({ 'sentiment.label': 1, 'source.publishedAt': -1 });

module.exports = mongoose.model('SocialMention', socialMentionSchema);
