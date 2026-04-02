const cheerio = require('cheerio');

const delay = require('../../utils/delay');
const logger = require('../../utils/logger');
const { competitorSources } = require('./constants');
const httpClient = require('./httpClient');

const randomDelayMs = () => 500 + Math.floor(Math.random() * 1000);

const readText = ($card, selector) => {
  if (!selector) {
    return null;
  }

  if (selector.startsWith('[') && selector.endsWith(']')) {
    const attributeName = selector.replace('[', '').replace(']', '');
    return $card.attr(attributeName) || null;
  }

  return $card.find(selector).first().text().trim() || null;
};

const readHref = ($card, selector) => {
  return $card.find(selector).first().attr('href') || null;
};

exports.scrapeCompetitorListings = async (sourceConfig) => {
  logger.info(`Scraping listings from ${sourceConfig.name}`);

  const html = await httpClient.get(sourceConfig.listingUrl, {
    headers: {
      Referer: sourceConfig.website,
      DNT: '1',
    },
  });

  const $ = cheerio.load(html);
  const listings = [];

  $(sourceConfig.listingSelector).each((index, element) => {
    const $card = $(element);
    listings.push({
      title: readText($card, sourceConfig.fields.title),
      area: readText($card, sourceConfig.fields.area),
      category: readText($card, sourceConfig.fields.category),
      price: readText($card, sourceConfig.fields.price),
      address: readText($card, sourceConfig.fields.address),
      externalId: readText($card, sourceConfig.fields.externalId),
      sourceUrl: readHref($card, sourceConfig.fields.sourceUrl),
      status: 'active',
      rawPayloadId: `${sourceConfig.name}-${index}-${Date.now()}`,
    });
  });

  await delay(randomDelayMs());
  return listings.filter((item) => item.title && item.price);
};

exports.scrapeAllCompetitors = async () => {
  const results = [];

  for (const sourceConfig of competitorSources) {
    try {
      const listings = await exports.scrapeCompetitorListings(sourceConfig);
      results.push({ sourceConfig, listings });
      await delay(randomDelayMs());
    } catch (error) {
      logger.error(`Scrape failed for ${sourceConfig.name}: ${error.message}`);
      throw error;
    }
  }

  return results;
};
