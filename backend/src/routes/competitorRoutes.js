const express = require('express');

const controller = require('../controllers/competitorController');

const router = express.Router();

router.get('/', controller.getCompetitors);
router.get('/:id', controller.getCompetitorById);
router.post('/', controller.createCompetitor);
router.patch('/:id', controller.updateCompetitor);

module.exports = router;
