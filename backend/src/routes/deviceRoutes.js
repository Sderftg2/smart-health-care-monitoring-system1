const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/data', deviceController.receiveDeviceData);
router.get('/:deviceId/latest', deviceController.getLatestData);
router.get('/:deviceId/history', deviceController.getDataHistory);

module.exports = router;
