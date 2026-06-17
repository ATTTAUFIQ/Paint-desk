const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('dashboard'));
const dashboardController = require('../controllers/dashboard.controller');

router.get('/stats', dashboardController.getStats);
router.get('/charts', dashboardController.getCharts);

module.exports = router;
