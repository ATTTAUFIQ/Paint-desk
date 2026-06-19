const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');

// Public route to fetch an invoice by its secure ID
router.get('/invoice/:id', saleController.getPublicSaleById);

module.exports = router;
