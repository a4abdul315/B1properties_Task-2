# Insights API Examples

## 1. Price Tracker

### Endpoint

`GET /api/v1/insights/price-tracker?days=30&groupBy=week&area=dubai-marina&category=residential`

### Example Response

```json
{
  "success": true,
  "data": {
    "metric": "price-tracker",
    "groupBy": "week",
    "windowDays": 30,
    "filters": {
      "area": "dubai-marina",
      "category": "residential",
      "competitor": null
    },
    "series": [
      {
        "x": "2026-W10",
        "area": "dubai-marina",
        "category": "residential",
        "avgPrice": 1850000,
        "minPrice": 1760000,
        "maxPrice": 1940000,
        "avgChangePercent": 2.18,
        "sampleSize": 18
      }
    ]
  }
}
```

## 2. Listing Velocity

### Endpoint

`GET /api/v1/insights/listing-velocity?days=14&groupBy=day&competitor=66112233445566778899aabb`

### Example Response

```json
{
  "success": true,
  "data": {
    "metric": "listing-velocity",
    "groupBy": "day",
    "windowDays": 14,
    "filters": {
      "area": null,
      "category": null,
      "competitor": "66112233445566778899aabb"
    },
    "summary": {
      "totalNewListings": 42,
      "activeListings": 36
    },
    "series": [
      {
        "x": "2026-04-01",
        "area": "business-bay",
        "category": "commercial",
        "competitorId": "66112233445566778899aabb",
        "competitor": "Property Monitor Beta",
        "newListings": 6
      }
    ]
  }
}
```

## 3. Market Heat Index

### Endpoint

`GET /api/v1/insights/market-heat?days=30&category=residential`

### Example Response

```json
{
  "success": true,
  "data": {
    "metric": "market-heat-index",
    "windowDays": 30,
    "filters": {
      "area": null,
      "category": "residential",
      "competitor": null
    },
    "summary": {
      "totalAreas": 3,
      "hottestArea": "dubai-marina",
      "highestHeatIndex": 81.42
    },
    "series": [
      {
        "area": "dubai-marina",
        "listingVolume": 54,
        "activeListings": 49,
        "priceFluctuation": 7.83,
        "socialMentions": 28,
        "engagementScore": 410,
        "heatIndex": 81.42,
        "trend": "hot"
      }
    ]
  }
}
```
