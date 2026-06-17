const LicenseSetting = require('../models/LicenseSetting');
const AuditLog = require('../models/AuditLog');

// Get current license settings
exports.getLicense = async (req, res) => {
  try {
    let license = await LicenseSetting.findOne();
    
    // If no license exists, create a default one
    if (!license) {
      license = await LicenseSetting.create({});
      await AuditLog.create({
        action: 'License Initialized',
        details: { message: 'Default license configuration created' }
      });
    }

    res.status(200).json({
      success: true,
      data: license
    });
  } catch (error) {
    console.error('Error fetching license:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update license settings
exports.updateLicense = async (req, res) => {
  try {
    const { active, expiryDate, modules } = req.body;
    let license = await LicenseSetting.findOne();

    if (!license) {
      license = new LicenseSetting();
    }

    const logs = [];

    // Check for ERP Active/Deactive changes
    if (license.active !== active && active !== undefined) {
      logs.push({
        action: active ? 'ERP Activated' : 'ERP Deactivated',
        details: { previous: license.active, new: active }
      });
      license.active = active;
    }

    // Check for Expiry Date changes
    if (expiryDate && (!license.expiryDate || new Date(license.expiryDate).getTime() !== new Date(expiryDate).getTime())) {
      logs.push({
        action: 'Expiry Date Changed',
        details: { previous: license.expiryDate, new: expiryDate }
      });
      license.expiryDate = expiryDate;
    }

    // Check for Module changes
    if (modules) {
      for (const [moduleName, isEnabled] of Object.entries(modules)) {
        if (license.modules[moduleName] !== isEnabled) {
          logs.push({
            action: isEnabled ? 'Module Enabled' : 'Module Disabled',
            details: { module: moduleName }
          });
        }
      }
      license.modules = { ...license.modules, ...modules };
    }

    await license.save();

    // Save all audit logs
    if (logs.length > 0) {
      await AuditLog.insertMany(logs);
    }

    res.status(200).json({
      success: true,
      message: 'License updated successfully',
      data: license
    });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
