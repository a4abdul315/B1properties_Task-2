const normalizePrice = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return 0;
  }

  const numericValue = String(value).replace(/[^0-9.]/g, '');
  return Number(numericValue || 0);
};

exports.normalizeListing = (record, competitorId) => {
  const price = normalizePrice(record.price);
  const timestamp = new Date();

  return {
    title: record.title?.trim() || 'Untitled listing',
    competitor: competitorId,
    category: record.category?.trim().toLowerCase() || 'uncategorized',
    area: record.area?.trim().toLowerCase() || 'unknown',
    address: record.address?.trim() || null,
    price,
    currency: (record.currency || 'AED').toUpperCase(),
    status: record.status || 'active',
    listedAt: record.listedAt ? new Date(record.listedAt) : timestamp,
    source: {
      type: 'listing_site',
      platform: record.platform,
      externalId: record.externalId || null,
      externalUrl: record.sourceUrl || null,
      collectedAt: timestamp,
      fetchedAt: timestamp,
      firstSeenAt: timestamp,
      lastSeenAt: timestamp,
      rawPayloadId: record.rawPayloadId || null,
    },
    metadata: {
      scraperVersion: '1.0.0',
      rawSourceName: record.platform,
    },
  };
};

exports.normalizeNewsMention = (article, competitorId = null) => {
  const publishedAt = article.publishedAt ? new Date(article.publishedAt) : new Date();

  return {
    competitor: competitorId,
    source: {
      type: 'news_api',
      platform: article.platform || 'newsapi',
      externalId: article.externalId || article.url,
      externalUrl: article.url || null,
      publishedAt,
      collectedAt: new Date(),
    },
    authorHandle: article.author ? article.author.trim().toLowerCase() : null,
    title: article.title?.trim() || null,
    content: article.content?.trim() || article.description?.trim() || article.title?.trim() || 'No content',
    sentiment: {
      score: article.sentimentScore ?? 0,
      label: article.sentimentLabel || 'neutral',
    },
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
    },
    metadata: {
      sourceName: article.sourceName || null,
    },
  };
};

exports.normalizeSocialMention = (mention, competitorId = null, listingId = null) => {
  return {
    competitor: competitorId,
    listing: listingId,
    source: {
      type: 'social_api',
      platform: mention.platform || 'simulated-social',
      externalId: mention.externalId,
      externalUrl: mention.url || null,
      publishedAt: mention.publishedAt ? new Date(mention.publishedAt) : new Date(),
      collectedAt: new Date(),
    },
    authorHandle: mention.authorHandle?.trim().toLowerCase() || null,
    title: mention.title?.trim() || null,
    content: mention.content?.trim() || 'Simulated social mention',
    sentiment: {
      score: mention.sentimentScore ?? 0,
      label: mention.sentimentLabel || 'neutral',
    },
    engagement: {
      likes: mention.likes ?? 0,
      comments: mention.comments ?? 0,
      shares: mention.shares ?? 0,
    },
    metadata: {
      simulation: true,
    },
  };
};
