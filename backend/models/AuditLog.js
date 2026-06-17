const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'ERP Activated', 
      'ERP Deactivated', 
      'Expiry Date Changed', 
      'Module Enabled', 
      'Module Disabled',
      'License Initialized'
    ]
  },
  details: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
