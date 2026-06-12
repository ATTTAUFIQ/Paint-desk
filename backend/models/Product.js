const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
  },
  unitType: {
    type: String,
    required: true,
    enum: ['Ltr', 'Kg', 'Pcs', 'Gal'],
  },
  purchasePrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  gstPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lowStockLimit: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Custom JSON transform to handle Decimal128 correctly in frontend
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.purchasePrice) ret.purchasePrice = ret.purchasePrice.toString();
    if (ret.sellingPrice) ret.sellingPrice = ret.sellingPrice.toString();
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
