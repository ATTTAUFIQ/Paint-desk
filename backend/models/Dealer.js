const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
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
  pendingBalance: {
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
dealerSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.pendingBalance) ret.pendingBalance = ret.pendingBalance.toString();
    return ret;
  }
});

const Dealer = mongoose.model('Dealer', dealerSchema);

module.exports = Dealer;
