const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'My Paint Shop'
  },
  shopAddress: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  invoiceFooter: {
    type: String,
    default: 'Thank you for your business!'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  signatureUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
