const Competitor = require('../../models/Competitor');
const Listing = require('../../models/Listing');
const logger = require('../../utils/logger');
const scraperService = require('./scraperService');
const newsIngestionService = require('./newsIngestionService');
const socialSimulationService = require('./socialSimulationService');
const persistenceService = require('./persistenceService');

exports.runCompetitorScraping = async () => {
  const scrapeResults = await scraperService.scrapeAllCompetitors();

  for (const result of scrapeResults) {
    await persistenceService.persistListingBatch(result.sourceConfig, result.listings);
  }

  logger.info('Competitor scraping pipeline completed');
};

exports.runNewsIngestion = async () => {
  const articles = await newsIngestionService.fetchNewsArticles();
  const competitors = await Competitor.find({ status: 'active' });

  const taggedArticles = articles.map((article) => {
    const matchedCompetitor = competitors.find((competitor) => {
      const haystacks = [article.title, article.description, article.content]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystacks.includes(competitor.name.toLowerCase());
    });

    return {
      article,
      competitor: matchedCompetitor || null,
    };
  });

  for (const item of taggedArticles) {
    await persistenceService.persistNewsBatch([item.article], item.competitor);
  }

  logger.info('News ingestion pipeline completed');
};

exports.runSocialSimulation = async () => {
  const simulatedMentions = await socialSimulationService.generateSocialMentions();

  for (const mention of simulatedMentions) {
    const competitor = mention.competitorId
      ? await Competitor.findById(mention.competitorId)
      : null;
    const listing = mention.listingId ? await Listing.findById(mention.listingId) : null;

    await persistenceService.persistSocialBatch([mention], competitor, listing);
  }

  logger.info('Social simulation pipeline completed');
};
