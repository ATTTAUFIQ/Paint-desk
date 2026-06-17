const LicenseSetting = require('../models/LicenseSetting');

exports.checkLicense = async (req, res, next) => {
  try {
    const license = await LicenseSetting.findOne();
    
    // If no license is found, allow or create default. We'll let it pass or initialize it.
    if (!license) {
      return next(); 
    }

    if (!license.active) {
      return res.status(403).json({
        success: false,
        message: 'ERP has been deactivated. Contact administrator.'
      });
    }

    if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
      return res.status(403).json({
        success: false,
        message: 'License expired. Contact administrator.'
      });
    }

    // Attach license to request so we can use it in checkModuleAccess
    req.license = license;
    next();
  } catch (error) {
    console.error('License check error:', error);
    res.status(500).json({ success: false, message: 'Server Error during license check' });
  }
};

exports.checkModuleAccess = (moduleName) => {
  return (req, res, next) => {
    // If license is not attached (maybe it was skipped or missing), just continue
    if (!req.license) {
      return next();
    }

    const hasAccess = req.license.modules && req.license.modules[moduleName];

    if (!hasAccess) {
      // capitalize first letter for message
      const formattedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
      return res.status(403).json({
        success: false,
        message: `${formattedModule} module is disabled.`
      });
    }

    next();
  };
};
