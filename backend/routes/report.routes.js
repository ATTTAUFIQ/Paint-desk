const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('reports'));
const reportController = require('../controllers/report.controller');

router.get('/:type', reportController.getReport);

module.exports = router;
