const express = require('express');

const controller = require('../controllers/insightController');

const router = express.Router();

router.get('/overview', controller.getOverview);
router.get('/price-tracker', controller.getPriceTrends);
router.get('/price-trends', controller.getPriceTrends);
router.get('/listing-velocity', controller.getListingVelocity);
router.get('/market-heat', controller.getMarketHeatIndex);
router.get('/market-heat-index', controller.getMarketHeatIndex);

module.exports = router;
