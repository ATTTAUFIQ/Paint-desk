const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');

// @route   GET /api/license
// @desc    Get current license configuration
// @access  Public (so frontend can check status)
router.get('/', licenseController.getLicense);

// @route   PUT /api/license
// @desc    Update license configuration
// @access  Public (in production, should be protected by super admin)
router.put('/', licenseController.updateLicense);

module.exports = router;
