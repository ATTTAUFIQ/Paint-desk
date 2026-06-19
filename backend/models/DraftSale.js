const mongoose = require('mongoose');

const draftSaleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
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
});

const draftSaleSchema = new mongoose.Schema({
  items: [draftSaleItemSchema],
  subTotal: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    min: 0,
  },
  totalGst: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

draftSaleSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.subTotal) ret.subTotal = ret.subTotal.toString();
    if (ret.totalGst) ret.totalGst = ret.totalGst.toString();
    if (ret.totalAmount) ret.totalAmount = ret.totalAmount.toString();
    if (ret.items) {
      ret.items = ret.items.map(item => {
        if (item.unitPrice) item.unitPrice = item.unitPrice.toString();
        if (item.gstAmount) item.gstAmount = item.gstAmount.toString();
        if (item.totalPrice) item.totalPrice = item.totalPrice.toString();
        return item;
      });
    }
    return ret;
  }
});

const DraftSale = mongoose.model('DraftSale', draftSaleSchema);

module.exports = DraftSale;
