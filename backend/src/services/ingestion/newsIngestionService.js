const httpClient = require('./httpClient');
const config = require('../../utils/config');
const logger = require('../../utils/logger');

exports.fetchNewsArticles = async () => {
  if (!config.newsApiKey) {
    logger.warn('NEWS_API_KEY is not configured. Skipping news ingestion.');
    return [];
  }

  const data = await httpClient.get(config.newsApiBaseUrl, {
    params: {
      q: 'real estate OR property market',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20,
      apiKey: config.newsApiKey,
    },
    headers: {
      Accept: 'application/json',
    },
  });

  return (data.articles || []).map((article) => ({
    platform: 'newsapi',
    externalId: article.url,
    url: article.url,
    author: article.author,
    title: article.title,
    description: article.description,
    content: article.content,
    publishedAt: article.publishedAt,
    sourceName: article.source?.name,
    sentimentScore: 0,
    sentimentLabel: 'neutral',
  }));
};
