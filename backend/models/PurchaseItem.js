const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
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

purchaseItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.unitPrice) ret.unitPrice = ret.unitPrice.toString();
    if (ret.gstAmount) ret.gstAmount = ret.gstAmount.toString();
    if (ret.totalPrice) ret.totalPrice = ret.totalPrice.toString();
    return ret;
  }
});

const PurchaseItem = mongoose.model('PurchaseItem', purchaseItemSchema);

module.exports = PurchaseItem;
