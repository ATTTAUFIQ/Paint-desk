const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  gstPercentage: {
    type: Number,
    required: true,
    min: 0,
  },
  gstAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
}, { timestamps: true });

// Add index for performance (top selling products)
saleItemSchema.index({ productId: 1 });

saleItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.unitPrice) ret.unitPrice = ret.unitPrice.toString();
    if (ret.gstAmount) ret.gstAmount = ret.gstAmount.toString();
    if (ret.totalPrice) ret.totalPrice = ret.totalPrice.toString();
    return ret;
  }
});

const SaleItem = mongoose.model('SaleItem', saleItemSchema);

module.exports = SaleItem;
