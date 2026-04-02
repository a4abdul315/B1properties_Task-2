const express = require('express');

const listingRoutes = require('./listingRoutes');
const competitorRoutes = require('./competitorRoutes');
const insightRoutes = require('./insightRoutes');
const alertRoutes = require('./alertRoutes');

const router = express.Router();

router.use('/listings', listingRoutes);
router.use('/competitors', competitorRoutes);
router.use('/insights', insightRoutes);
router.use('/alerts', alertRoutes);

module.exports = router;
