const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const StockMovement = require('../models/StockMovement');

const createSale = async (saleData) => {
  try {
    // Determine payment status
    const totalAmount = parseFloat(saleData.totalAmount);
    const amountPaid = parseFloat(saleData.amountPaid);
    let paymentStatus = 'Pending';
    if (amountPaid >= totalAmount) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partial';
    }

    // 1. Create Sale
    const sale = new Sale({
      invoiceNumber: saleData.invoiceNumber,
      customerId: saleData.customerId,
      saleDate: saleData.saleDate,
      subTotal: saleData.subTotal,
      totalDiscount: saleData.totalDiscount || 0,
      totalGst: saleData.totalGst,
      totalAmount: saleData.totalAmount,
      amountPaid: saleData.amountPaid,
      paymentStatus: paymentStatus,
    });
    
    await sale.save();

    // 2. Prepare Items and Update Product Stocks
    const itemsToInsert = [];
    for (const item of saleData.items) {
      itemsToInsert.push({
        ...item,
        saleId: sale._id,
      });

      // Auto Reduce Stock
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.currentStock}`);
      }

      const previousStock = product.currentStock;
      const newStock = previousStock - item.quantity;

      await Product.findByIdAndUpdate(
        item.productId,
        { currentStock: newStock }
      );

      // Log Stock Movement
      const movement = new StockMovement({
        productId: item.productId,
        movementType: 'OUT',
        quantity: -item.quantity,
        referenceType: 'Sale',
        referenceId: sale._id,
        previousStock: previousStock,
        newStock: newStock,
        remarks: `Sale Invoice: ${sale.invoiceNumber}`,
        movementDate: sale.saleDate
      });
      await movement.save();
    }
    
    await SaleItem.insertMany(itemsToInsert);

    // 3. Update Customer Outstanding Balance (Credit given)
    const creditAmount = totalAmount - amountPaid;
    if (creditAmount > 0) {
      await Customer.findByIdAndUpdate(
        saleData.customerId,
        { $inc: { outstandingBalance: creditAmount } }
      );
    }

    return sale;
  } catch (error) {
    throw error;
  }
};

const getSales = async (query = {}) => {
  const { search, page = 1, limit = 10 } = query;
  
  const filter = {};
  if (search) {
    filter.invoiceNumber = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .populate('customerId', 'name mobileNumber')
      .sort({ saleDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Sale.countDocuments(filter),
  ]);

  return {
    sales,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getSaleById = async (id) => {
  const sale = await Sale.findById(id)
    .populate('customerId', 'name mobileNumber address gstNumber')
    .populate({
      path: 'items',
      populate: { path: 'productId', select: 'name productCode brand unitType' }
    });
    
  if (!sale) {
    throw new Error('Sale not found');
  }
  return sale;
};

const cancelSale = async (id) => {
  try {
    const sale = await Sale.findById(id);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === 'Cancelled') throw new Error('Sale is already cancelled');

    const items = await SaleItem.find({ saleId: id });

    // 1. Revert Product Stock (Add back) & Log
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const previousStock = product.currentStock;
        const newStock = previousStock + item.quantity;

        await Product.findByIdAndUpdate(
          item.productId,
          { currentStock: newStock }
        );

        const movement = new StockMovement({
          productId: item.productId,
          movementType: 'IN',
          quantity: item.quantity,
          referenceType: 'Sale',
          referenceId: sale._id,
          previousStock: previousStock,
          newStock: newStock,
          remarks: `Cancelled Sale Invoice: ${sale.invoiceNumber}`,
        });
        await movement.save();
      }
    }

    // 2. Revert Customer Balance (Subtract the credit given)
    const creditAmount = parseFloat(sale.totalAmount) - parseFloat(sale.amountPaid);
    if (creditAmount > 0) {
      await Customer.findByIdAndUpdate(
        sale.customerId,
        { $inc: { outstandingBalance: -creditAmount } }
      );
    }

    // 3. Mark Sale as Cancelled
    sale.status = 'Cancelled';
    await sale.save();

    return sale;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
};
