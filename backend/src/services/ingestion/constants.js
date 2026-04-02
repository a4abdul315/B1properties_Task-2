module.exports = {
  requestHeaders: [
    {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Accept-Language': 'en-US,en;q=0.8',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.7',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  ],
  competitorSources: [
    {
      name: 'Property Monitor Alpha',
      website: 'https://example.com/alpha',
      categories: ['residential'],
      trackedAreas: ['dubai-marina', 'downtown-dubai'],
      listingUrl: 'https://example.com/alpha/listings',
      listingSelector: '.listing-card',
      fields: {
        title: '.listing-title',
        area: '.listing-area',
        category: '.listing-category',
        price: '.listing-price',
        address: '.listing-address',
        externalId: '[data-listing-id]',
        sourceUrl: 'a',
      },
    },
    {
      name: 'Property Monitor Beta',
      website: 'https://example.com/beta',
      categories: ['commercial'],
      trackedAreas: ['business-bay', 'jlt'],
      listingUrl: 'https://example.com/beta/market',
      listingSelector: '.property-item',
      fields: {
        title: '.property-title',
        area: '.property-area',
        category: '.property-category',
        price: '.property-price',
        address: '.property-address',
        externalId: '[data-id]',
        sourceUrl: 'a',
      },
    },
  ],
  socialSimulationTemplates: [
    'Competitor {competitor} is trending in {area} with strong engagement around {category} inventory.',
    'Buyers are reacting to a pricing shift from {competitor} in {area}.',
    'Conversation volume is rising for {competitor} listings in {area} under {category}.',
  ],
};
