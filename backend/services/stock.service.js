const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const getStockMetrics = async () => {
  // Use aggregation to count total, low stock, and out of stock
  const metrics = await Product.aggregate([
    {
      $facet: {
        totalProducts: [{ $count: 'count' }],
        outOfStock: [{ $match: { currentStock: { $lte: 0 } } }, { $count: 'count' }],
        lowStock: [
          { $match: { $expr: { $lte: ['$currentStock', '$lowStockLimit'] }, currentStock: { $gt: 0 } } },
          { $count: 'count' }
        ]
      }
    }
  ]);

  return {
    totalProducts: metrics[0].totalProducts[0]?.count || 0,
    outOfStock: metrics[0].outOfStock[0]?.count || 0,
    lowStock: metrics[0].lowStock[0]?.count || 0,
  };
};

const getMovements = async (query = {}) => {
  const { productId, type, search, page = 1, limit = 20 } = query;
  
  const filter = {};
  if (productId) filter.productId = productId;
  if (type) filter.movementType = type;

  // For search, we might need to populate product and then filter, but simple filtering on remarks is easier for now
  if (search) {
    filter.remarks = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate('productId', 'name productCode')
      .sort({ movementDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    StockMovement.countDocuments(filter),
  ]);

  return {
    movements,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const adjustStock = async (data) => {
  const { productId, quantity, type, remarks } = data;
  
  if (!quantity || quantity <= 0) throw new Error('Quantity must be greater than 0');

  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;
    let newStock = previousStock;
    let actualMovementQty = quantity;

    if (type === 'IN') {
      newStock += quantity;
    } else if (type === 'OUT') {
      if (previousStock < quantity) throw new Error('Cannot reduce stock below 0');
      newStock -= quantity;
      actualMovementQty = -quantity;
    } else {
      throw new Error('Invalid adjustment type. Use IN or OUT.');
    }

    await Product.findByIdAndUpdate(
      productId,
      { currentStock: newStock }
    );

    const movement = new StockMovement({
      productId,
      movementType: 'ADJUSTMENT',
      quantity: actualMovementQty,
      referenceType: 'Manual',
      previousStock,
      newStock,
      remarks: remarks || 'Manual Adjustment',
    });

    await movement.save();

    return movement;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getStockMetrics,
  getMovements,
  adjustStock
};
