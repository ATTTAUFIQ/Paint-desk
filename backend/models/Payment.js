const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  partyType: {
    type: String,
    required: true,
    enum: ['Customer', 'Dealer'],
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'partyType',
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Other'],
  },
  referenceNumber: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Custom JSON transform to handle Decimal128 correctly in frontend
paymentSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.amount) ret.amount = ret.amount.toString();
    return ret;
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
