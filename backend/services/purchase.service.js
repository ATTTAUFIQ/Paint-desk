const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const Dealer = require('../models/Dealer');
const StockMovement = require('../models/StockMovement');

const createPurchase = async (purchaseData) => {
  try {
    // Determine payment status
    const totalAmount = parseFloat(purchaseData.totalAmount);
    const amountPaid = parseFloat(purchaseData.amountPaid || 0);
    let paymentStatus = 'Pending';
    if (amountPaid >= totalAmount) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partial';
    }

    // 1. Create Purchase
    const purchase = new Purchase({
      purchaseNumber: purchaseData.purchaseNumber,
      dealerId: purchaseData.dealerId,
      purchaseDate: purchaseData.purchaseDate,
      subTotal: purchaseData.subTotal,
      totalGst: purchaseData.totalGst,
      totalAmount: purchaseData.totalAmount,
      amountPaid: amountPaid,
      paymentStatus: paymentStatus,
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

    // 3. Update Dealer Pending Balance (Only the outstanding amount)
    const pendingAmount = totalAmount - amountPaid;
    if (pendingAmount > 0) {
      await Dealer.findByIdAndUpdate(
        purchaseData.dealerId,
        { $inc: { pendingBalance: pendingAmount } }
      );
    }
    
    return purchase;
  } catch (error) {
    throw error;
  }
};

const getPurchases = async (query = {}) => {
  const { search, page = 1, limit = 10, dealerId } = query;
  
  const filter = {};
  if (search) {
    filter.purchaseNumber = { $regex: search, $options: 'i' };
  }
  if (dealerId) {
    filter.dealerId = dealerId;
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

    // 2. Revert Dealer Balance (Subtract the pending balance we originally added)
    const pendingAmount = parseFloat(purchase.totalAmount) - parseFloat(purchase.amountPaid || 0);
    if (pendingAmount > 0) {
      await Dealer.findByIdAndUpdate(
        purchase.dealerId,
        { $inc: { pendingBalance: -pendingAmount } }
      );
    }

    // 3. Mark Purchase as Cancelled
    purchase.status = 'Cancelled';
    await purchase.save();

    return purchase;
  } catch (error) {
    throw error;
  }
};

const updatePurchase = async (id, updateData) => {
  try {
    const purchase = await Purchase.findById(id);
    if (!purchase) throw new Error('Purchase not found');
    if (purchase.status === 'Cancelled') throw new Error('Cannot edit a cancelled purchase');

    const oldItems = await PurchaseItem.find({ purchaseId: id });

    // 1. Revert Old Product Stock & Log Movement
    for (const item of oldItems) {
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
          remarks: `Reverted for PO Edit: ${purchase.purchaseNumber}`,
          movementDate: new Date()
        });
        await movement.save();
      }
    }

    // 2. Revert Old Dealer Balance
    const oldPendingAmount = parseFloat(purchase.totalAmount) - parseFloat(purchase.amountPaid || 0);
    if (oldPendingAmount > 0) {
      await Dealer.findByIdAndUpdate(
        purchase.dealerId,
        { $inc: { pendingBalance: -oldPendingAmount } }
      );
    }

    // 3. Delete Old Items
    await PurchaseItem.deleteMany({ purchaseId: id });

    // 4. Update Purchase Info
    const newTotalAmount = parseFloat(updateData.totalAmount);
    const newAmountPaid = parseFloat(updateData.amountPaid || 0);
    let newPaymentStatus = 'Pending';
    if (newAmountPaid >= newTotalAmount) {
      newPaymentStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'Partial';
    }

    purchase.purchaseNumber = updateData.purchaseNumber;
    purchase.dealerId = updateData.dealerId;
    purchase.purchaseDate = updateData.purchaseDate;
    purchase.subTotal = updateData.subTotal;
    purchase.totalGst = updateData.totalGst;
    purchase.totalAmount = updateData.totalAmount;
    purchase.amountPaid = newAmountPaid;
    purchase.paymentStatus = newPaymentStatus;
    await purchase.save();

    // 5. Apply New Items & Stock
    const itemsToInsert = [];
    for (const item of updateData.items) {
      itemsToInsert.push({
        ...item,
        purchaseId: purchase._id,
      });

      const product = await Product.findById(item.productId);
      const previousStock = product ? product.currentStock : 0;
      const newStock = previousStock + item.quantity;

      await Product.findByIdAndUpdate(
        item.productId,
        { currentStock: newStock }
      );

      const movement = new StockMovement({
        productId: item.productId,
        movementType: 'IN',
        quantity: item.quantity,
        referenceType: 'Purchase',
        referenceId: purchase._id,
        previousStock: previousStock,
        newStock: newStock,
        remarks: `Edited PO: ${purchase.purchaseNumber}`,
        movementDate: purchase.purchaseDate
      });
      await movement.save();
    }
    
    await PurchaseItem.insertMany(itemsToInsert);

    // 6. Apply New Dealer Balance
    const newPendingAmount = newTotalAmount - newAmountPaid;
    if (newPendingAmount > 0) {
      await Dealer.findByIdAndUpdate(
        updateData.dealerId,
        { $inc: { pendingBalance: newPendingAmount } }
      );
    }

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
  updatePurchase,
};
