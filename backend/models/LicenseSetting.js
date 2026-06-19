const mongoose = require('mongoose');

const licenseSettingSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    required: true,
    default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Default 1 year from now
  },
  modules: {
    dashboard: { type: Boolean, default: true },
    products: { type: Boolean, default: true },
    customers: { type: Boolean, default: true },
    dealers: { type: Boolean, default: true },
    purchases: { type: Boolean, default: true },
    sales: { type: Boolean, default: true },
    stock: { type: Boolean, default: true },
    quick: { type: Boolean, default: true },
    expenses: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    settings: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('LicenseSetting', licenseSettingSchema);
