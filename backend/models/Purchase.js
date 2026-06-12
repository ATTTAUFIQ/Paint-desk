const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true,
  },
  subTotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  totalGst: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Completed', 'Cancelled'],
    default: 'Completed',
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

// Virtual to populate items
purchaseSchema.virtual('items', {
  ref: 'PurchaseItem',
  localField: '_id',
  foreignField: 'purchaseId',
});

purchaseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.subTotal) ret.subTotal = ret.subTotal.toString();
    if (ret.totalGst) ret.totalGst = ret.totalGst.toString();
    if (ret.totalAmount) ret.totalAmount = ret.totalAmount.toString();
    if (ret.amountPaid) ret.amountPaid = ret.amountPaid.toString();
    return ret;
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
