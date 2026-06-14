const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/', paymentController.recordPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.get('/party/:partyType/:partyId', paymentController.getPaymentsByParty);

module.exports = router;
