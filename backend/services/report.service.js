const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Dealer = require('../models/Dealer');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const getDateFilter = (startDate, endDate, dateField) => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter[dateField].$lte = end;
    }
  }
  return filter;
};

const getSalesReport = async (startDate, endDate) => {
  const match = getDateFilter(startDate, endDate, 'saleDate');
  const sales = await Sale.find(match)
    .populate('customerId', 'name mobileNumber')
    .sort({ saleDate: -1 });

  const summary = sales.reduce((acc, sale) => {
    acc.totalAmount += parseFloat(sale.totalAmount.toString());
    acc.totalGst += parseFloat(sale.totalGst.toString());
    return acc;
  }, { totalAmount: 0, totalGst: 0 });

  return { data: sales, summary };
};

const getPurchaseReport = async (startDate, endDate) => {
  const match = getDateFilter(startDate, endDate, 'purchaseDate');
  const purchases = await Purchase.find(match)
    .populate('dealerId', 'name mobileNumber')
    .sort({ purchaseDate: -1 });

  const summary = purchases.reduce((acc, purchase) => {
    acc.totalAmount += parseFloat(purchase.totalAmount.toString());
    acc.totalGst += parseFloat(purchase.totalGst.toString());
    return acc;
  }, { totalAmount: 0, totalGst: 0 });

  return { data: purchases, summary };
};

const getExpenseReport = async (startDate, endDate) => {
  const match = getDateFilter(startDate, endDate, 'expenseDate');
  const expenses = await Expense.find(match).sort({ expenseDate: -1 });

  const summary = expenses.reduce((acc, exp) => {
    acc.totalAmount += parseFloat(exp.amount.toString());
    return acc;
  }, { totalAmount: 0 });

  return { data: expenses, summary };
};

const getProfitReport = async (startDate, endDate) => {
  const saleMatch = getDateFilter(startDate, endDate, 'saleDate');
  const expenseMatch = getDateFilter(startDate, endDate, 'expenseDate');

  const [salesAgg, cogsAgg, expensesAgg] = await Promise.all([
    Sale.aggregate([
      { $match: saleMatch },
      { $group: { _id: null, totalSales: { $sum: '$subTotal' } } }
    ]),
    Sale.aggregate([
      { $match: saleMatch },
      { $lookup: { from: 'saleitems', localField: '_id', foreignField: 'saleId', as: 'items' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { 
          _id: null, 
          totalCogs: { $sum: { $multiply: ['$items.quantity', '$product.purchasePrice'] } } 
      } }
    ]),
    Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ])
  ]);

  const totalSales = salesAgg[0] ? parseFloat(salesAgg[0].totalSales.toString()) : 0;
  const totalCogs = cogsAgg[0] ? parseFloat(cogsAgg[0].totalCogs.toString()) : 0;
  const totalExpenses = expensesAgg[0] ? parseFloat(expensesAgg[0].totalExpenses.toString()) : 0;

  const netProfit = totalSales - totalCogs - totalExpenses;

  const data = [
    { category: 'Revenue (Sales Subtotal)', amount: totalSales },
    { category: 'Cost of Goods Sold (COGS)', amount: -totalCogs },
    { category: 'Operating Expenses', amount: -totalExpenses },
    { category: 'Net Profit', amount: netProfit }
  ];

  return { data, summary: { netProfit, totalSales, totalCogs, totalExpenses } };
};

const getCustomerOutstanding = async () => {
  // Outstanding > 0
  const customers = await Customer.find({ outstandingBalance: { $gt: 0 } }).sort({ outstandingBalance: -1 });
  const summary = customers.reduce((acc, c) => {
    acc.totalOutstanding += parseFloat(c.outstandingBalance.toString());
    return acc;
  }, { totalOutstanding: 0 });

  return { data: customers, summary };
};

const getDealerOutstanding = async () => {
  const dealers = await Dealer.find({ pendingBalance: { $gt: 0 } }).sort({ pendingBalance: -1 });
  const summary = dealers.reduce((acc, d) => {
    acc.totalPending += parseFloat(d.pendingBalance.toString());
    return acc;
  }, { totalPending: 0 });

  return { data: dealers, summary };
};

const getStockReport = async () => {
  const products = await Product.find().sort({ currentStock: 1 });
  
  const summary = products.reduce((acc, p) => {
    acc.totalItems += p.currentStock || 0;
    const price = p.purchasePrice ? parseFloat(p.purchasePrice.toString()) : 0;
    acc.totalStockValue += ((p.currentStock || 0) * price);
    return acc;
  }, { totalItems: 0, totalStockValue: 0 });

  return { data: products, summary };
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getExpenseReport,
  getProfitReport,
  getCustomerOutstanding,
  getDealerOutstanding,
  getStockReport
};
