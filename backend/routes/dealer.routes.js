const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('dealers'));
const dealerController = require('../controllers/dealer.controller');

router.post('/', dealerController.createDealer);
router.get('/', dealerController.getDealers);
router.get('/:id', dealerController.getDealerById);
router.put('/:id', dealerController.updateDealer);
router.delete('/:id', dealerController.deleteDealer);

module.exports = router;
