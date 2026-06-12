const Setting = require('../models/Setting');

const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { shopName, shopAddress, gstNumber, phoneNumber, invoiceFooter } = req.body;
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = new Setting();
    }

    if (shopName !== undefined) settings.shopName = shopName;
    if (shopAddress !== undefined) settings.shopAddress = shopAddress;
    if (gstNumber !== undefined) settings.gstNumber = gstNumber;
    if (phoneNumber !== undefined) settings.phoneNumber = phoneNumber;
    if (invoiceFooter !== undefined) settings.invoiceFooter = invoiceFooter;

    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const uploadImages = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        // Construct URL path relative to static folder
        settings.logoUrl = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.signature && req.files.signature[0]) {
        settings.signatureUrl = `/uploads/${req.files.signature[0].filename}`;
      }
      await settings.save();
    }

    res.status(200).json({ success: true, data: settings, message: 'Images uploaded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadImages
};
