const crypto = require('crypto');

const Competitor = require('../../models/Competitor');
const Listing = require('../../models/Listing');
const { socialSimulationTemplates } = require('./constants');

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

exports.generateSocialMentions = async () => {
  const competitors = await Competitor.find({ status: 'active' }).limit(5);
  const mentions = [];

  for (const competitor of competitors) {
    const listing = await Listing.findOne({ competitor: competitor._id, status: 'active' }).sort({ createdAt: -1 });
    const area = listing?.area || randomFrom(competitor.trackedAreas || ['unknown']);
    const category = listing?.category || randomFrom(competitor.categories || ['residential']);
    const template = randomFrom(socialSimulationTemplates);
    const content = template
      .replace('{competitor}', competitor.name)
      .replace('{area}', area)
      .replace('{category}', category);

    mentions.push({
      platform: 'simulated-social',
      externalId: crypto.createHash('sha1').update(`${competitor.id}-${Date.now()}-${content}`).digest('hex'),
      url: null,
      authorHandle: `${competitor.name.toLowerCase().replace(/\s+/g, '_')}_watch`,
      content,
      title: `Market buzz for ${competitor.name}`,
      sentimentScore: Number((Math.random() * 2 - 1).toFixed(2)),
      sentimentLabel: 'neutral',
      likes: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 80),
      shares: Math.floor(Math.random() * 50),
      publishedAt: new Date(),
      competitorId: competitor._id,
      listingId: listing?._id || null,
    });
  }

  return mentions;
};
