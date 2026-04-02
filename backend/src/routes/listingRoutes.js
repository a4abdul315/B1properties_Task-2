const express = require('express');

const controller = require('../controllers/listingController');

const router = express.Router();

router.get('/', controller.getListings);
router.get('/:id', controller.getListingById);
router.post('/', controller.createListing);
router.patch('/:id', controller.updateListing);

module.exports = router;
