const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  outstandingBalance: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Custom JSON transform to handle Decimal128 correctly in frontend
customerSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.outstandingBalance) ret.outstandingBalance = ret.outstandingBalance.toString();
    return ret;
  }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
