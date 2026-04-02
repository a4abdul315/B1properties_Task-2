# Data Pipeline Flow

## Overview

1. `node-cron` triggers three ingestion jobs:
   - competitor listing scraping
   - news API ingestion
   - social simulation
2. Each job runs through a retry wrapper with exponential-style backoff.
3. Raw source records are normalized into internal collection shapes.
4. A deduplication layer checks source identity and content similarity before persistence.
5. New or changed records are saved into MongoDB collections:
   - `Listing`
   - `PriceHistory`
   - `SocialMention`
   - `Alert`

## Competitor Scraping Flow

1. `scraperService.scrapeAllCompetitors()` iterates configured sources.
2. The HTTP client applies rotating headers, request timeouts, and retry logic.
3. The scraper waits between requests using randomized delays to reduce scraping fingerprints.
4. Cheerio extracts structured listing fields from each page.
5. `persistenceService.persistListingBatch()` normalizes records, upserts listings, and writes `PriceHistory` snapshots when prices change.

## News Ingestion Flow

1. `newsIngestionService.fetchNewsArticles()` pulls articles from the configured news API.
2. The orchestrator attempts lightweight competitor matching using article text.
3. Articles are normalized into `SocialMention`-style records with `source.type = news_api`.
4. Deduplication prevents repeated storage of the same article.

## Social Simulation Flow

1. `socialSimulationService.generateSocialMentions()` creates synthetic social posts based on active competitors and recent listings.
2. Mentions are normalized and deduplicated before saving.
3. High-engagement simulated mentions create alert records for downstream monitoring.

## Anti-Scraping Techniques Included

- Rotating browser-like headers
- Per-source request spacing with randomized delays
- Automatic retries with backoff
- Request timeout limits
- Source-aware referer and DNT headers
- Modular scraping so proxying, CAPTCHA handling, or queue workers can be added later without rewriting the pipeline
