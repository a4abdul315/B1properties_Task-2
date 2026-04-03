# Market Intelligence Dashboard

A full-stack market intelligence platform for collecting competitor signals, analyzing market movement, and surfacing alerts through a React dashboard.

## What This Project Does

This repository contains:

- a React dashboard with filters, charts, alerts, empty states, and live updates
- a Node.js / Express backend with REST APIs for listings, competitors, insights, and alerts
- MongoDB schemas for listings, competitors, price history, social mentions, and alerts
- a data ingestion layer for competitor listings, news, and simulated social data
- analytical insight APIs for price tracking, listing velocity, and market heat
- an alerting system for price drops, listing spikes, high market heat, and social spikes
- cron-based background jobs for ingestion and alert evaluation

## Current Status

### Implemented

- Listings API
- Competitor API
- Insights API
- Alerts API
- Competitor listing scraping structure
- News API ingestion
- Social mention simulation
- Price tracker
- Listing velocity
- Market heat index
- Dashboard filters for area, competitor, category, window, and resolution
- Competitor comparison and trend charts
- Live alerts with Socket.IO
- Demo seed data
- Cron-based scheduled jobs

### Partially Implemented

- Social collection is simulated, not connected to a real social media API
- Scraper source configs are demo-ready but still need real production selectors and source tuning
- Legal/compliance considerations are reflected in project decisions and discussion, but there is not yet a dedicated compliance document in the repo

## Tech Stack

### Frontend

- React
- Vite
- Axios
- Recharts
- Socket.IO client

### Backend

- Node.js
- Express
- Mongoose
- Winston
- Morgan
- Socket.IO
- node-cron

### Data

- MongoDB

## Repository Structure

```text
.
├─ backend/
├─ frontend/
├─ architecture.md
└─ README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB

Recommended local ports:

- frontend: `3000`
- backend: `5000`
- MongoDB: `27017`

## Quick Start

1. Start MongoDB
2. Create backend and frontend `.env` files
3. Install backend dependencies
4. Install frontend dependencies
5. Start the backend
6. Start the frontend
7. Seed demo data if the dashboard is empty

## Environment Setup

### Backend

Create `backend/.env` from [backend/.env.example](./backend/.env.example).

Minimal local example:

```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
MONGODB_URI=mongodb://127.0.0.1:27017/market_intelligence
CLIENT_ORIGIN=http://localhost:3000
NEWS_API_KEY=replace_me
```

Notes:

- If `NEWS_API_KEY` is missing, news ingestion is skipped by design
- Redis is no longer required by this codebase

### Frontend

Create `frontend/.env` from [frontend/.env.example](./frontend/.env.example).

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Install Dependencies

### Backend

```powershell
cd backend
npm install
```

### Frontend

```powershell
cd frontend
npm install
```

## Run The Application

### Terminal 1: Backend API

```powershell
cd backend
npm run dev
```

Backend endpoints:

- app: `http://localhost:5000`
- health: `http://localhost:5000/health`
- metrics: `http://localhost:5000/metrics`

### Terminal 2: Frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## Demo Data

If the dashboard has no listings, trends, or alerts, seed demo data:

```powershell
cd backend
npm run seed
```

The seed script creates:

- competitors
- listings across multiple areas
- price history
- social mentions
- alerts

Seed file:

- [`backend/src/scripts/seedDemoData.js`](./backend/src/scripts/seedDemoData.js)

After seeding, refresh the frontend.

## Why The Dashboard Can Appear Empty

Most common causes:

- the database has no data yet
- filters are too narrow
- the backend is connected to a different MongoDB instance than expected

First thing to try:

- Area: `All areas`
- Competitor: `All competitors`
- Category: `All categories`

If the dashboard is still empty, run the seed command above.

## Main Functionality

### Data Collection Layer

Implemented in the backend ingestion services:

- competitor listings: scraper-based collection
- news: API-based collection
- social: simulated feed generation

Relevant files:

- [`backend/src/services/ingestion/scraperService.js`](./backend/src/services/ingestion/scraperService.js)
- [`backend/src/services/ingestion/newsIngestionService.js`](./backend/src/services/ingestion/newsIngestionService.js)
- [`backend/src/services/ingestion/socialSimulationService.js`](./backend/src/services/ingestion/socialSimulationService.js)
- [`backend/src/services/ingestion/ingestionOrchestrator.js`](./backend/src/services/ingestion/ingestionOrchestrator.js)

### Analytical Insights

Implemented:

- price tracker
- listing velocity
- market heat index

Relevant files:

- [`backend/src/services/insightService.js`](./backend/src/services/insightService.js)
- [`backend/src/routes/insightRoutes.js`](./backend/src/routes/insightRoutes.js)
- [`backend/docs/insights-api-examples.md`](./backend/docs/insights-api-examples.md)

### Alerts

Implemented:

- price drop alerts
- listing spike alerts
- high market heat alerts
- social spike alerts
- realtime socket delivery plus polling fallback

Relevant files:

- [`backend/src/services/alertRuleEngine.js`](./backend/src/services/alertRuleEngine.js)
- [`backend/src/services/alertService.js`](./backend/src/services/alertService.js)
- [`backend/docs/alert-system.md`](./backend/docs/alert-system.md)

### Dashboard UI

The frontend includes:

- filter bar
- KPI cards
- price trends chart
- competitor comparison chart
- market heat chart
- alerts panel
- empty-state messaging
- live alert updates

Relevant files:

- [`frontend/src/pages/DashboardPage.jsx`](./frontend/src/pages/DashboardPage.jsx)
- [`frontend/src/context/DashboardContext.jsx`](./frontend/src/context/DashboardContext.jsx)
- [`frontend/src/components/filters/FilterBar.jsx`](./frontend/src/components/filters/FilterBar.jsx)
- [`frontend/src/components/alerts/AlertsPanel.jsx`](./frontend/src/components/alerts/AlertsPanel.jsx)

## API Endpoints

### Core

- `GET /api/v1/competitors`
- `GET /api/v1/listings`
- `GET /api/v1/alerts`
- `PATCH /api/v1/alerts/:id/read`

### Insights

- `GET /api/v1/insights/overview`
- `GET /api/v1/insights/price-tracker`
- `GET /api/v1/insights/listing-velocity`
- `GET /api/v1/insights/market-heat`

## Scheduling, Normalization, Deduplication, Anti-Scraping

### Update Frequency

Controlled by backend environment variables:

- `COMPETITOR_SCRAPE_SCHEDULE`
- `NEWS_INGESTION_SCHEDULE`
- `SOCIAL_SIMULATION_SCHEDULE`
- `ALERT_EVALUATION_SCHEDULE`

### Normalization

Incoming listing, news, and social records are normalized into a consistent internal shape for:

- area
- category
- timestamps
- source metadata
- numeric price values

File:

- [`backend/src/services/ingestion/normalizationService.js`](./backend/src/services/ingestion/normalizationService.js)

### Deduplication

Deduplication uses:

- exact source identity when available
- normalized content fingerprints when IDs are unreliable

Files:

- [`backend/src/services/ingestion/deduplicationService.js`](./backend/src/services/ingestion/deduplicationService.js)
- [`backend/src/models/Listing.js`](./backend/src/models/Listing.js)
- [`backend/src/models/SocialMention.js`](./backend/src/models/SocialMention.js)

### Anti-Scraping Strategy

Currently implemented:

- rotating request headers
- randomized delays
- retry with backoff
- request timeout limits
- source-aware request metadata

Files:

- [`backend/src/services/ingestion/httpClient.js`](./backend/src/services/ingestion/httpClient.js)
- [`backend/src/services/ingestion/scraperService.js`](./backend/src/services/ingestion/scraperService.js)

## Background Jobs

This project now uses pure `node-cron` for background scheduling.

Current scheduled flows:

- competitor scraping
- news ingestion
- simulated social generation
- alert evaluation

Relevant files:

- [`backend/src/jobs/ingestionJob.js`](./backend/src/jobs/ingestionJob.js)
- [`backend/src/jobs/alertEvaluationJob.js`](./backend/src/jobs/alertEvaluationJob.js)
- [`backend/src/jobs/index.js`](./backend/src/jobs/index.js)

## Documentation Map

- Architecture: [`architecture.md`](./architecture.md)
- Alert system: [`backend/docs/alert-system.md`](./backend/docs/alert-system.md)
- Data pipeline flow: [`backend/docs/data-pipeline-flow.md`](./backend/docs/data-pipeline-flow.md)
- Insights examples: [`backend/docs/insights-api-examples.md`](./backend/docs/insights-api-examples.md)
- Production notes: [`backend/docs/production-optimization.md`](./backend/docs/production-optimization.md)
- Frontend notes: [`frontend/README.md`](./frontend/README.md)

## Troubleshooting

### Backend crashes on startup

Check:

- MongoDB is running
- `backend/.env` exists
- `MONGODB_URI` is correct

### Seed fails

Check:

- MongoDB is running
- backend `.env` points to the MongoDB instance you expect
- rerun `npm run seed`

### Frontend cannot load data

Check:

- backend is running on port `5000`
- `VITE_API_BASE_URL` is correct
- browser console and network tab for failed API requests

## Compliance Note

The repository does not yet contain a dedicated legal/compliance file. For production use, plan around:

- preferring official APIs over scraping when available
- respecting rate limits and site terms
- reviewing robots.txt and legal restrictions before scraping
- minimizing collection of personal data

## Final Notes

This project is complete as a working full-stack demo and technical foundation. The main remaining work for a real-world rollout is:

- production-grade source integrations
- scraper tuning per target site
- deployment assets such as Docker / infra configuration
- formal legal/compliance documentation
