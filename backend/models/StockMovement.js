const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  referenceType: {
    type: String,
    enum: ['Purchase', 'Sale', 'Manual', 'Return'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can ref Purchase or Sale. Since it's dynamic, we leave ref out or handle in populate dynamically.
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
  },
  movementDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;
