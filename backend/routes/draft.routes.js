const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('quick'));
const draftController = require('../controllers/draft.controller');

router.get('/', draftController.getDraft);
router.post('/scan', draftController.scanToDraft);
router.put('/item/:itemId', draftController.updateItemQuantity);
router.delete('/item/:itemId', draftController.removeItem);
router.delete('/clear', draftController.clearDraft);

module.exports = router;
