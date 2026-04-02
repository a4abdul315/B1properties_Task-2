# Production Optimization Plan

## Performance Strategy

### API Layer

- Enable gzip compression for JSON-heavy analytics responses
- Cache read-heavy insight endpoints in Redis for short TTL windows
- Keep write paths uncached and invalidate by namespace after major ingestion events if freshness must be tighter
- Separate API instances from worker instances so long-running jobs do not compete with user traffic

### Background Processing

- Use BullMQ with Redis-backed queues for ingestion and alert evaluation
- Keep cron only as a lightweight scheduler that enqueues work
- Run workers as separate processes or containers using `npm run worker`

### Query Optimization

- Heavy chart endpoints should aggregate from `PriceHistory` and `SocialMention`, not only raw listings
- Precompute longer-range summaries if date windows exceed 90 days
- Keep hot dashboard endpoints behind Redis caching with low TTLs like 60-120 seconds

## Redis Caching

### What To Cache

- `GET /insights/overview`
- `GET /insights/price-tracker`
- `GET /insights/listing-velocity`
- `GET /insights/market-heat`
- Competitor lookups and filter metadata if they become high-volume

### Trade-Offs

- Short TTL cache improves p95 latency and lowers MongoDB load
- Cached insights can be slightly stale for up to the TTL window
- If exact real-time accuracy is required, reduce TTL and invalidate on ingestion completion, at the cost of higher Redis churn

## BullMQ Queue Design

### Queues

- `market-intelligence:ingestion-jobs`
- `market-intelligence:alert-jobs`

### Why BullMQ

- Retries, backoff, and dead-letter style retention are better than in-process cron alone
- Jobs survive API restarts because queue state lives in Redis
- Horizontal scaling becomes straightforward by increasing worker replicas

### Trade-Offs

- Redis becomes a critical dependency
- Operational complexity is higher than plain cron
- For small single-node deployments, cron fallback is cheaper and simpler

## Horizontal Scaling

### API Tier

- Run multiple Node.js API containers behind an AWS Application Load Balancer or Nginx ingress
- Keep API instances stateless
- Use Redis for shared cache and BullMQ state
- Socket.IO should use a Redis adapter if you later need multi-instance websocket fan-out

### Worker Tier

- Run dedicated worker containers for ingestion and alert processing
- Scale workers independently from the API based on queue depth

### Data Tier

- Use MongoDB Atlas replica sets for HA
- Consider sharding only after collection size and write throughput justify it

## MongoDB Indexing Strategy

### Listings

- `{ area, category, status, createdAt: -1 }` for filters and dashboards
- `{ competitor, status, listedAt: -1 }` for competitor activity views
- `{ source.platform, source.externalId, competitor }` unique sparse for ingest idempotency
- `{ deduplication.fingerprint, competitor }` for near-duplicate checks

### PriceHistory

- `{ listing, source.observedAt: -1 }` for historical charts
- `{ competitor, source.observedAt: -1 }` for competitor trend queries

### SocialMention

- `{ competitor, source.publishedAt: -1 }`
- `{ listing, source.publishedAt: -1 }`
- `{ sentiment.label, source.publishedAt: -1 }`

### Alerts

- `{ severity, isRead, createdAt: -1 }`
- `{ competitor, type, createdAt: -1 }`
- `{ source.platform, source.externalId, type }`

### Trade-Offs

- More indexes speed reads but slow writes and increase storage
- Only keep indexes aligned to real query patterns
- Revisit unused indexes after observing production traffic

## Deployment Plan

### Recommended: AWS

- Frontend: S3 + CloudFront, or Vercel if you want simpler frontend delivery
- Backend API: ECS Fargate or EKS
- Workers: ECS Fargate services running `npm run worker`
- MongoDB: MongoDB Atlas
- Redis: ElastiCache for Redis
- Monitoring: CloudWatch + Grafana + Prometheus scrape for `/metrics`
- Secrets: AWS Secrets Manager or SSM Parameter Store

### Simpler Hybrid Option

- Frontend on Vercel
- Backend and workers on AWS ECS
- MongoDB Atlas + ElastiCache Redis

### Why Not Pure Vercel For Everything

- Long-running scraping and BullMQ workers are a poor fit for serverless execution
- WebSocket-heavy, queue-heavy ingestion systems need persistent processes

## Environment Setup

### Required Variables

- `MONGODB_URI`
- `REDIS_URL`
- `NEWS_API_KEY`
- `CLIENT_ORIGIN`
- `QUEUE_ENABLED`
- `CACHE_ENABLED`
- `ALERT_*` thresholds

### Runtime Split

- API process: `npm start`
- Worker process: `npm run worker`

## Logging and Monitoring

### Logging

- Keep Winston structured logs
- Add request correlation IDs if you need cross-service tracing
- Ship logs to CloudWatch, Datadog, or ELK

### Monitoring

- `/metrics` endpoint exposes Prometheus-compatible metrics
- Track:
  - API latency and error rate
  - Mongo query duration
  - Redis availability
  - BullMQ queue depth and retry counts
  - Worker job duration and failure rate
  - Socket connection count

## Production Decisions Summary

- Redis caching is worth it because analytics endpoints are read-heavy and aggregation-expensive
- BullMQ is worth it because ingestion and alert evaluation should survive restarts and scale independently
- AWS is the better backend platform because the app depends on persistent workers and websockets
- Vercel is still a strong choice for the React frontend because it is static-friendly and operationally simple
