const crypto = require('crypto');
const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['listing_site', 'news_api', 'social_api', 'manual'],
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    collectedAt: {
      type: Date,
      default: Date.now,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    rawPayloadId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const deduplicationSchema = new mongoose.Schema(
  {
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
    contentHash: {
      type: String,
      trim: true,
      index: true,
    },
    canonicalKey: {
      type: String,
      trim: true,
      index: true,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
      index: true,
    },
    mergeConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1,
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedTitle: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    competitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competitor',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    normalizedAddress: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    price: {
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
    priceInMinor: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'removed'],
      default: 'active',
      index: true,
    },
    bedrooms: {
      type: Number,
      min: 0,
      default: null,
    },
    bathrooms: {
      type: Number,
      min: 0,
      default: null,
    },
    areaSqFt: {
      type: Number,
      min: 0,
      default: null,
    },
    listedAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastPriceChangeAt: {
      type: Date,
      default: null,
    },
    source: {
      type: sourceSchema,
      required: true,
    },
    deduplication: {
      type: deduplicationSchema,
      default: () => ({}),
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

listingSchema.pre('validate', function setNormalizedFields(next) {
  this.normalizedTitle = this.title ? this.title.trim().toLowerCase() : null;
  this.normalizedAddress = this.address ? this.address.trim().toLowerCase() : null;
  this.area = this.area ? this.area.trim().toLowerCase() : this.area;
  this.category = this.category ? this.category.trim().toLowerCase() : this.category;
  this.priceInMinor = typeof this.price === 'number' ? Math.round(this.price * 100) : this.priceInMinor;

  const exactBase = [
    this.source?.platform || '',
    this.source?.externalId || '',
    this.competitor?.toString() || '',
  ].join('|');

  const fingerprintBase = [
    this.normalizedTitle || '',
    this.normalizedAddress || this.area || '',
    this.category || '',
    this.priceInMinor || '',
  ].join('|');

  this.deduplication = this.deduplication || {};
  this.deduplication.exactKey = crypto.createHash('sha1').update(exactBase).digest('hex');
  this.deduplication.fingerprint = crypto.createHash('sha1').update(fingerprintBase).digest('hex');
  this.deduplication.contentHash = crypto
    .createHash('sha1')
    .update(
      JSON.stringify({
        title: this.normalizedTitle,
        address: this.normalizedAddress,
        area: this.area,
        category: this.category,
        priceInMinor: this.priceInMinor,
        status: this.status,
      })
    )
    .digest('hex');
  this.deduplication.canonicalKey =
    this.deduplication.canonicalKey || this.deduplication.fingerprint;

  next();
});

listingSchema.index(
  { 'source.platform': 1, 'source.externalId': 1, competitor: 1 },
  { unique: true, sparse: true, name: 'uq_listing_source_external_competitor' }
);
listingSchema.index({ area: 1, category: 1, status: 1, createdAt: -1 });
listingSchema.index({ competitor: 1, status: 1, listedAt: -1 });
listingSchema.index({ priceInMinor: 1, area: 1, category: 1 });
listingSchema.index({ 'deduplication.fingerprint': 1, competitor: 1 });
listingSchema.index({ 'deduplication.duplicateOf': 1, updatedAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
