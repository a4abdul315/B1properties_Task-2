const express = require('express');

const controller = require('../controllers/alertController');

const router = express.Router();

router.get('/', controller.getAlerts);
router.post('/', controller.createAlertRule);
router.patch('/:id/read', controller.markAlertAsRead);

module.exports = router;
