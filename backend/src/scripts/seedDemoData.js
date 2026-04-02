const mongoose = require('mongoose');

const config = require('../utils/config');
const logger = require('../utils/logger');
const Competitor = require('../models/Competitor');
const Listing = require('../models/Listing');
const PriceHistory = require('../models/PriceHistory');
const SocialMention = require('../models/SocialMention');
const Alert = require('../models/Alert');

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const createListingSource = (platform, externalId, when) => ({
  type: 'listing_site',
  platform,
  externalId,
  externalUrl: `https://example.com/${platform}/listing/${externalId}`,
  collectedAt: when,
  fetchedAt: when,
  firstSeenAt: when,
  lastSeenAt: when,
  rawPayloadId: `${platform}-${externalId}`,
});

async function run() {
  await mongoose.connect(config.mongoUri);

  try {
    await Competitor.collection.dropIndex('trackedAreas_1_categories_1_status_1');
  } catch (error) {
    if (error.codeName !== 'IndexNotFound') {
      throw error;
    }
  }

  await Promise.all([
    Competitor.syncIndexes(),
    Listing.syncIndexes(),
    PriceHistory.syncIndexes(),
    SocialMention.syncIndexes(),
    Alert.syncIndexes(),
  ]);

  await Promise.all([
    Alert.deleteMany({}),
    SocialMention.deleteMany({}),
    PriceHistory.deleteMany({}),
    Listing.deleteMany({}),
    Competitor.deleteMany({}),
  ]);

  const competitors = await Competitor.insertMany([
    {
      name: 'Property Monitor Alpha',
      website: 'https://example.com/alpha',
      categories: ['residential', 'luxury'],
      trackedAreas: ['dubai-marina', 'downtown-dubai', 'palm-jumeirah', 'dubai-hills'],
      sourceIdentities: [
        {
          platform: 'property-monitor-alpha',
          externalId: 'alpha',
          profileUrl: 'https://example.com/alpha',
        },
      ],
    },
    {
      name: 'Property Monitor Beta',
      website: 'https://example.com/beta',
      categories: ['commercial', 'residential'],
      trackedAreas: ['business-bay', 'jlt', 'dubai-marina', 'dubai-creek-harbour', 'al-barsha'],
      sourceIdentities: [
        {
          platform: 'property-monitor-beta',
          externalId: 'beta',
          profileUrl: 'https://example.com/beta',
        },
      ],
    },
  ]);

  const [alpha, beta] = competitors;

  const listingSeeds = [
    {
      title: 'Marina View Apartment',
      competitor: alpha._id,
      category: 'residential',
      area: 'dubai-marina',
      address: 'Dubai Marina Walk',
      price: 1850000,
      status: 'active',
      listedAt: daysAgo(18),
      source: createListingSource('property-monitor-alpha', 'alpha-1', daysAgo(18)),
    },
    {
      title: 'Downtown Skyline Penthouse',
      competitor: alpha._id,
      category: 'luxury',
      area: 'downtown-dubai',
      address: 'Burj Vista District',
      price: 4200000,
      status: 'active',
      listedAt: daysAgo(12),
      source: createListingSource('property-monitor-alpha', 'alpha-2', daysAgo(12)),
    },
    {
      title: 'Business Bay Office Suite',
      competitor: beta._id,
      category: 'commercial',
      area: 'business-bay',
      address: 'Bay Square',
      price: 2350000,
      status: 'active',
      listedAt: daysAgo(10),
      source: createListingSource('property-monitor-beta', 'beta-1', daysAgo(10)),
    },
    {
      title: 'JLT Mixed Use Unit',
      competitor: beta._id,
      category: 'commercial',
      area: 'jlt',
      address: 'Cluster V',
      price: 1620000,
      status: 'active',
      listedAt: daysAgo(7),
      source: createListingSource('property-monitor-beta', 'beta-2', daysAgo(7)),
    },
    {
      title: 'Marina Family Apartment',
      competitor: beta._id,
      category: 'residential',
      area: 'dubai-marina',
      address: 'Marina Promenade',
      price: 1760000,
      status: 'active',
      listedAt: daysAgo(5),
      source: createListingSource('property-monitor-beta', 'beta-3', daysAgo(5)),
    },
    {
      title: 'Palm Beachfront Villa',
      competitor: alpha._id,
      category: 'luxury',
      area: 'palm-jumeirah',
      address: 'Frond M',
      price: 8900000,
      status: 'active',
      listedAt: daysAgo(9),
      source: createListingSource('property-monitor-alpha', 'alpha-3', daysAgo(9)),
    },
    {
      title: 'Dubai Hills Garden Home',
      competitor: alpha._id,
      category: 'residential',
      area: 'dubai-hills',
      address: 'Park Heights',
      price: 2650000,
      status: 'active',
      listedAt: daysAgo(6),
      source: createListingSource('property-monitor-alpha', 'alpha-4', daysAgo(6)),
    },
    {
      title: 'Creek Harbour Waterfront Flat',
      competitor: beta._id,
      category: 'residential',
      area: 'dubai-creek-harbour',
      address: 'Harbour Gate',
      price: 1980000,
      status: 'active',
      listedAt: daysAgo(4),
      source: createListingSource('property-monitor-beta', 'beta-4', daysAgo(4)),
    },
    {
      title: 'Al Barsha Retail Corner',
      competitor: beta._id,
      category: 'commercial',
      area: 'al-barsha',
      address: 'Sheikh Zayed Road',
      price: 3120000,
      status: 'active',
      listedAt: daysAgo(3),
      source: createListingSource('property-monitor-beta', 'beta-5', daysAgo(3)),
    },
    {
      title: 'Downtown Executive Loft',
      competitor: alpha._id,
      category: 'residential',
      area: 'downtown-dubai',
      address: 'Opera District',
      price: 2980000,
      status: 'active',
      listedAt: daysAgo(2),
      source: createListingSource('property-monitor-alpha', 'alpha-5', daysAgo(2)),
    },
  ];

  const listings = await Listing.insertMany(listingSeeds);

  const listingMap = Object.fromEntries(listings.map((listing) => [listing.title, listing]));

  await PriceHistory.insertMany([
    {
      listing: listingMap['Marina View Apartment']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-1-h1',
        observedAt: daysAgo(18),
      },
      previousPrice: 1800000,
      price: 1825000,
      currency: 'AED',
    },
    {
      listing: listingMap['Marina View Apartment']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-1-h2',
        observedAt: daysAgo(12),
      },
      previousPrice: 1825000,
      price: 1875000,
      currency: 'AED',
    },
    {
      listing: listingMap['Marina View Apartment']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-1-h3',
        observedAt: daysAgo(4),
      },
      previousPrice: 1875000,
      price: 1850000,
      currency: 'AED',
    },
    {
      listing: listingMap['Business Bay Office Suite']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-1-h1',
        observedAt: daysAgo(10),
      },
      previousPrice: 2280000,
      price: 2310000,
      currency: 'AED',
    },
    {
      listing: listingMap['Business Bay Office Suite']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-1-h2',
        observedAt: daysAgo(6),
      },
      previousPrice: 2310000,
      price: 2390000,
      currency: 'AED',
    },
    {
      listing: listingMap['Business Bay Office Suite']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-1-h3',
        observedAt: daysAgo(2),
      },
      previousPrice: 2390000,
      price: 2350000,
      currency: 'AED',
    },
    {
      listing: listingMap['Marina Family Apartment']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-3-h1',
        observedAt: daysAgo(5),
      },
      previousPrice: 1700000,
      price: 1730000,
      currency: 'AED',
    },
    {
      listing: listingMap['Marina Family Apartment']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-3-h2',
        observedAt: daysAgo(1),
      },
      previousPrice: 1730000,
      price: 1760000,
      currency: 'AED',
    },
    {
      listing: listingMap['Palm Beachfront Villa']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-3-h1',
        observedAt: daysAgo(9),
      },
      previousPrice: 8650000,
      price: 8725000,
      currency: 'AED',
    },
    {
      listing: listingMap['Palm Beachfront Villa']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-3-h2',
        observedAt: daysAgo(2),
      },
      previousPrice: 8725000,
      price: 8900000,
      currency: 'AED',
    },
    {
      listing: listingMap['Dubai Hills Garden Home']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-4-h1',
        observedAt: daysAgo(6),
      },
      previousPrice: 2580000,
      price: 2610000,
      currency: 'AED',
    },
    {
      listing: listingMap['Dubai Hills Garden Home']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-4-h2',
        observedAt: daysAgo(1),
      },
      previousPrice: 2610000,
      price: 2650000,
      currency: 'AED',
    },
    {
      listing: listingMap['Creek Harbour Waterfront Flat']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-4-h1',
        observedAt: daysAgo(4),
      },
      previousPrice: 1940000,
      price: 1965000,
      currency: 'AED',
    },
    {
      listing: listingMap['Creek Harbour Waterfront Flat']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-4-h2',
        observedAt: daysAgo(1),
      },
      previousPrice: 1965000,
      price: 1980000,
      currency: 'AED',
    },
    {
      listing: listingMap['Al Barsha Retail Corner']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-5-h1',
        observedAt: daysAgo(3),
      },
      previousPrice: 3050000,
      price: 3090000,
      currency: 'AED',
    },
    {
      listing: listingMap['Al Barsha Retail Corner']._id,
      competitor: beta._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-beta',
        externalId: 'beta-5-h2',
        observedAt: daysAgo(0),
      },
      previousPrice: 3090000,
      price: 3120000,
      currency: 'AED',
    },
    {
      listing: listingMap['Downtown Executive Loft']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-5-h1',
        observedAt: daysAgo(2),
      },
      previousPrice: 2910000,
      price: 2945000,
      currency: 'AED',
    },
    {
      listing: listingMap['Downtown Executive Loft']._id,
      competitor: alpha._id,
      source: {
        type: 'listing_site',
        platform: 'property-monitor-alpha',
        externalId: 'alpha-5-h2',
        observedAt: daysAgo(0),
      },
      previousPrice: 2945000,
      price: 2980000,
      currency: 'AED',
    },
  ]);

  const mentions = await SocialMention.insertMany([
    {
      competitor: alpha._id,
      listing: listingMap['Marina View Apartment']._id,
      source: {
        type: 'social_api',
        platform: 'simulated-social',
        externalId: 'soc-1',
        externalUrl: null,
        publishedAt: daysAgo(3),
        collectedAt: daysAgo(3),
      },
      authorHandle: 'marina_market_watch',
      title: 'Marina momentum',
      content: 'Buyers are reacting strongly to marina inventory this week.',
      sentiment: { score: 0.44, label: 'positive' },
      engagement: { likes: 88, comments: 24, shares: 11 },
    },
    {
      competitor: beta._id,
      listing: listingMap['Business Bay Office Suite']._id,
      source: {
        type: 'social_api',
        platform: 'simulated-social',
        externalId: 'soc-2',
        externalUrl: null,
        publishedAt: daysAgo(2),
        collectedAt: daysAgo(2),
      },
      authorHandle: 'bay_property_watch',
      title: 'Office demand',
      content: 'Commercial demand is picking up in Business Bay.',
      sentiment: { score: 0.32, label: 'positive' },
      engagement: { likes: 63, comments: 15, shares: 7 },
    },
    {
      competitor: beta._id,
      listing: listingMap['Marina Family Apartment']._id,
      source: {
        type: 'news_api',
        platform: 'newsapi',
        externalId: 'news-1',
        externalUrl: 'https://example.com/news-1',
        publishedAt: daysAgo(1),
        collectedAt: daysAgo(1),
      },
      authorHandle: 'realestate_desk',
      title: 'Marina prices edge higher',
      content: 'Analysts are watching renewed heat in Dubai Marina apartment pricing.',
      sentiment: { score: 0.27, label: 'positive' },
      engagement: { likes: 12, comments: 3, shares: 2 },
    },
    {
      competitor: alpha._id,
      listing: listingMap['Palm Beachfront Villa']._id,
      source: {
        type: 'social_api',
        platform: 'simulated-social',
        externalId: 'soc-3',
        externalUrl: null,
        publishedAt: daysAgo(1),
        collectedAt: daysAgo(1),
      },
      authorHandle: 'luxury_coast_watch',
      title: 'Palm luxury surge',
      content: 'Palm Jumeirah luxury villa interest is accelerating this week.',
      sentiment: { score: 0.58, label: 'positive' },
      engagement: { likes: 102, comments: 29, shares: 14 },
    },
    {
      competitor: alpha._id,
      listing: listingMap['Dubai Hills Garden Home']._id,
      source: {
        type: 'social_api',
        platform: 'simulated-social',
        externalId: 'soc-4',
        externalUrl: null,
        publishedAt: daysAgo(2),
        collectedAt: daysAgo(2),
      },
      authorHandle: 'suburb_property_watch',
      title: 'Dubai Hills demand',
      content: 'Dubai Hills family homes continue to attract steady buyer demand.',
      sentiment: { score: 0.35, label: 'positive' },
      engagement: { likes: 41, comments: 10, shares: 6 },
    },
    {
      competitor: beta._id,
      listing: listingMap['Creek Harbour Waterfront Flat']._id,
      source: {
        type: 'news_api',
        platform: 'newsapi',
        externalId: 'news-2',
        externalUrl: 'https://example.com/news-2',
        publishedAt: daysAgo(0),
        collectedAt: daysAgo(0),
      },
      authorHandle: 'harbour_realty_desk',
      title: 'Creek Harbour demand grows',
      content: 'Analysts note rising residential absorption in Dubai Creek Harbour.',
      sentiment: { score: 0.31, label: 'positive' },
      engagement: { likes: 16, comments: 4, shares: 3 },
    },
  ]);

  await Alert.insertMany([
    {
      type: 'price_drop',
      title: 'Price drop detected for Marina View Apartment',
      message: 'Property Monitor Alpha reduced pricing by 1.33% in Dubai Marina.',
      severity: 'medium',
      source: {
        type: 'system',
        platform: 'seed',
        externalId: 'seed-alert-1',
        generatedAt: daysAgo(1),
      },
      competitor: alpha._id,
      listing: listingMap['Marina View Apartment']._id,
      metadata: {
        threshold: 1,
      },
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      type: 'heat_index_change',
      title: 'High market heat in dubai-marina',
      message: 'Dubai Marina is showing elevated demand across listings and mentions.',
      severity: 'high',
      source: {
        type: 'system',
        platform: 'seed',
        externalId: 'seed-alert-2',
        generatedAt: daysAgo(0),
      },
      competitor: beta._id,
      listing: listingMap['Marina Family Apartment']._id,
      socialMention: mentions[2]._id,
      metadata: {
        threshold: 35,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  logger.info('Demo data seeded successfully');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
