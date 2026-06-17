const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('products'));
const stockController = require('../controllers/stock.controller');

router.get('/metrics', stockController.getStockMetrics);
router.get('/movements', stockController.getMovements);
router.post('/adjust', stockController.adjustStock);

module.exports = router;
