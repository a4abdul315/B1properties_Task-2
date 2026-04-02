const crypto = require('crypto');
const mongoose = require('mongoose');

const sourceIdentitySchema = new mongoose.Schema(
  {
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
    profileUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const competitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    categories: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    trackedAreas: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    sourceIdentities: {
      type: [sourceIdentitySchema],
      default: [],
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
        ref: 'Competitor',
        default: null,
        index: true,
      },
      mergeConfidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1,
      },
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active',
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
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

competitorSchema.pre('validate', function setDeduplication(next) {
  this.normalizedName = this.name ? this.name.trim().toLowerCase() : null;
  this.categories = (this.categories || []).map((item) => item.trim().toLowerCase());
  this.trackedAreas = (this.trackedAreas || []).map((item) => item.trim().toLowerCase());

  const exactBase = [this.normalizedName || '', this.website || ''].join('|');
  const fingerprintBase = [
    this.normalizedName || '',
    [...this.categories].sort().join(','),
    [...this.trackedAreas].sort().join(','),
  ].join('|');

  this.deduplication = this.deduplication || {};
  this.deduplication.exactKey = crypto.createHash('sha1').update(exactBase).digest('hex');
  this.deduplication.fingerprint = crypto.createHash('sha1').update(fingerprintBase).digest('hex');

  next();
});

competitorSchema.index({ normalizedName: 1 }, { unique: true, name: 'uq_competitor_normalized_name' });
competitorSchema.index(
  { 'sourceIdentities.platform': 1, 'sourceIdentities.externalId': 1 },
  { sparse: true, name: 'idx_competitor_source_identity' }
);
competitorSchema.index({ trackedAreas: 1, status: 1 }, { name: 'idx_competitor_tracked_areas_status' });
competitorSchema.index({ categories: 1, status: 1 }, { name: 'idx_competitor_categories_status' });

module.exports = mongoose.model('Competitor', competitorSchema);
