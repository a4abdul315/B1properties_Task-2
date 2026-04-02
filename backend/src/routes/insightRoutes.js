const express = require('express');

const controller = require('../controllers/insightController');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const config = require('../utils/config');

const router = express.Router();

router.get('/overview', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getOverview);
router.get('/price-tracker', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getPriceTrends);
router.get('/price-trends', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getPriceTrends);
router.get('/listing-velocity', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getListingVelocity);
router.get('/market-heat', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getMarketHeatIndex);
router.get('/market-heat-index', cacheMiddleware('insights', config.insightsCacheTtlSeconds), controller.getMarketHeatIndex);

module.exports = router;
