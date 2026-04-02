# Alert System

## Trigger Conditions

- Price drop greater than `ALERT_PRICE_DROP_THRESHOLD`
- Listing spike greater than `ALERT_LISTING_SPIKE_THRESHOLD`
- Market heat index greater than `ALERT_HEAT_INDEX_THRESHOLD`

## Backend Logic

1. `persistenceService` creates `PriceHistory`
2. `alertRuleEngine.evaluatePriceDropAlert()` triggers immediate price-drop alerts
3. `alertEvaluationJob` runs scheduled checks for listing spikes and market heat
4. Alerts are stored in MongoDB `Alert`
5. `alertPublisher` emits real-time socket events

## Frontend Integration

1. The dashboard loads alerts from `GET /api/v1/alerts`
2. Socket.IO listens for `alerts:new` and `alerts:updated`
3. Polling still refreshes the alert list every 45 seconds as fallback
