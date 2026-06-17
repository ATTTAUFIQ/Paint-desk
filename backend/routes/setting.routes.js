const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('settings'));
const settingController = require('../controllers/setting.controller');
const upload = require('../middleware/upload');

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

// Specialized route for multipart/form-data
router.post('/upload', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), settingController.uploadImages);

module.exports = router;
