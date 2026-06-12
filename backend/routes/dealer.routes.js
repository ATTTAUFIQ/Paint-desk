const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealer.controller');

router.post('/', dealerController.createDealer);
router.get('/', dealerController.getDealers);
router.get('/:id', dealerController.getDealerById);
router.put('/:id', dealerController.updateDealer);
router.delete('/:id', dealerController.deleteDealer);

module.exports = router;
