const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const Dealer = require('../models/Dealer');
const StockMovement = require('../models/StockMovement');

const createPurchase = async (purchaseData) => {
  try {
    // 1. Create Purchase
    const purchase = new Purchase({
      purchaseNumber: purchaseData.purchaseNumber,
      dealerId: purchaseData.dealerId,
      purchaseDate: purchaseData.purchaseDate,
      subTotal: purchaseData.subTotal,
      totalGst: purchaseData.totalGst,
      totalAmount: purchaseData.totalAmount,
    });
    
    await purchase.save();

    // 2. Prepare Items and Update Product Stocks
    const itemsToInsert = [];
    for (const item of purchaseData.items) {
      itemsToInsert.push({
        ...item,
        purchaseId: purchase._id,
      });

      // Auto Increase Stock
      const product = await Product.findById(item.productId);
      const previousStock = product ? product.currentStock : 0;
      const newStock = previousStock + item.quantity;

      await Product.findByIdAndUpdate(
        item.productId,
        { currentStock: newStock }
      );

      // Log Stock Movement
      const movement = new StockMovement({
        productId: item.productId,
        movementType: 'IN',
        quantity: item.quantity,
        referenceType: 'Purchase',
        referenceId: purchase._id,
        previousStock: previousStock,
        newStock: newStock,
        remarks: `Purchase Order: ${purchase.purchaseNumber}`,
        movementDate: purchase.purchaseDate
      });
      await movement.save();
    }
    
    await PurchaseItem.insertMany(itemsToInsert);

    // 3. Update Dealer Pending Balance
    await Dealer.findByIdAndUpdate(
      purchaseData.dealerId,
      { $inc: { pendingBalance: purchaseData.totalAmount } }
    );
    
    return purchase;
  } catch (error) {
    throw error;
  }
};

const getPurchases = async (query = {}) => {
  const { search, page = 1, limit = 10 } = query;
  
  const filter = {};
  if (search) {
    filter.purchaseNumber = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate('dealerId', 'name mobileNumber')
      .sort({ purchaseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Purchase.countDocuments(filter),
  ]);

  return {
    purchases,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getPurchaseById = async (id) => {
  const purchase = await Purchase.findById(id)
    .populate('dealerId', 'name mobileNumber address gstNumber')
    .populate({
      path: 'items',
      populate: { path: 'productId', select: 'name productCode brand unitType' }
    });
    
  if (!purchase) {
    throw new Error('Purchase not found');
  }
  return purchase;
};

const cancelPurchase = async (id) => {
  try {
    const purchase = await Purchase.findById(id);
    if (!purchase) throw new Error('Purchase not found');
    if (purchase.status === 'Cancelled') throw new Error('Purchase is already cancelled');

    const items = await PurchaseItem.find({ purchaseId: id });

    // 1. Revert Product Stock & Log Movement
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const previousStock = product.currentStock;
        const newStock = previousStock - item.quantity;

        await Product.findByIdAndUpdate(
          item.productId,
          { currentStock: newStock }
        );

        const movement = new StockMovement({
          productId: item.productId,
          movementType: 'OUT',
          quantity: -item.quantity,
          referenceType: 'Purchase',
          referenceId: purchase._id,
          previousStock: previousStock,
          newStock: newStock,
          remarks: `Cancelled PO: ${purchase.purchaseNumber}`,
        });
        await movement.save();
      }
    }

    // 2. Revert Dealer Balance
    await Dealer.findByIdAndUpdate(
      purchase.dealerId,
      { $inc: { pendingBalance: -purchase.totalAmount } }
    );

    // 3. Mark Purchase as Cancelled
    purchase.status = 'Cancelled';
    await purchase.save();

    return purchase;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  cancelPurchase,
};
