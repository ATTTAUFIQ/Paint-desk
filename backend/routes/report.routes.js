const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/:type', reportController.getReport);

module.exports = router;
