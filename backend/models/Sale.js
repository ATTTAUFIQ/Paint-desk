const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  },
  customerName: {
    type: String,
  },
  subTotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  totalDiscount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
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
  saleDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

// Add indexes for performance
saleSchema.index({ saleDate: -1 });

// Virtual to populate items
saleSchema.virtual('items', {
  ref: 'SaleItem',
  localField: '_id',
  foreignField: 'saleId',
});

saleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.subTotal) ret.subTotal = ret.subTotal.toString();
    if (ret.totalDiscount) ret.totalDiscount = ret.totalDiscount.toString();
    if (ret.totalGst) ret.totalGst = ret.totalGst.toString();
    if (ret.totalAmount) ret.totalAmount = ret.totalAmount.toString();
    if (ret.amountPaid) ret.amountPaid = ret.amountPaid.toString();
    return ret;
  }
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
