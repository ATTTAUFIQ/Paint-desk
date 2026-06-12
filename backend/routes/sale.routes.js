const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);
router.get('/:id', saleController.getSaleById);
router.post('/:id/cancel', saleController.cancelSale);

module.exports = router;
