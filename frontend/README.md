# Market Intelligence Frontend

## Folder Structure

```text
frontend/
  src/
    components/
      alerts/
      charts/
      filters/
      layout/
    context/
    pages/
    services/
    styles/
    App.jsx
    main.jsx
  .env.example
  index.html
  package.json
  vite.config.js
```

## Main Components

- `DashboardPage`: page-level composition for filters, metrics, charts, and alerts
- `DashboardContext`: Context API state management and API loading
- `FilterBar`: area, competitor, category, time window, and grouping controls
- `PriceTrendChart`: line chart for historical price tracking
- `CompetitorComparisonChart`: bar chart for listing velocity comparison
- `MarketHeatChart`: bar chart for area heat scoring
- `AlertsPanel`: sidebar alert feed

## Example UI Layout

- Header hero with summary cards
- Filter toolbar below the hero
- Main content area with KPI cards and chart grid
- Sticky right sidebar for alerts

## API Integration

- Axios client in `src/services/apiClient.js`
- Dashboard endpoints in `src/services/dashboardApi.js`
- Uses:
  - `GET /competitors`
  - `GET /insights/price-tracker`
  - `GET /insights/listing-velocity`
  - `GET /insights/market-heat`
  - `GET /alerts`
