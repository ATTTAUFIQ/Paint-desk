const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('sales'));
const paymentController = require('../controllers/payment.controller');

router.post('/', paymentController.recordPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.get('/party/:partyType/:partyId', paymentController.getPaymentsByParty);

module.exports = router;
