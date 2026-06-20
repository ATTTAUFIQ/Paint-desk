const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SaleItem = require('../models/SaleItem');
const mongoose = require('mongoose');

const getDashboardStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayMatch = { $gte: startOfDay, $lte: endOfDay };

  const [
    salesTodayAgg,
    cogsTodayAgg,
    purchasesTodayAgg,
    expensesTodayAgg,
    totalCustomers,
    totalProducts,
    lowStockAgg,
    outOfStockAgg
  ] = await Promise.all([
    Sale.aggregate([
      { $match: { saleDate: todayMatch } },
      { $group: { _id: null, total: { $sum: '$subTotal' } } }
    ]),
    Sale.aggregate([
      { $match: { saleDate: todayMatch } },
      { $lookup: { from: 'saleitems', localField: '_id', foreignField: 'saleId', as: 'items' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { 
          _id: null, 
          totalCogs: { $sum: { $multiply: ['$items.quantity', '$product.purchasePrice'] } } 
      } }
    ]),
    Purchase.aggregate([
      { $match: { purchaseDate: todayMatch } },
      { $group: { _id: null, total: { $sum: '$subTotal' } } }
    ]),
    Expense.aggregate([
      { $match: { expenseDate: todayMatch } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Customer.countDocuments(),
    Product.countDocuments(),
    Product.aggregate([
      { $match: { $expr: { $lte: ['$currentStock', '$lowStockLimit'] }, currentStock: { $gt: 0 } } },
      { $count: 'count' }
    ]),
    Product.countDocuments({ currentStock: { $lte: 0 } })
  ]);

  const salesToday = salesTodayAgg[0] ? parseFloat(salesTodayAgg[0].total.toString()) : 0;
  const cogsToday = cogsTodayAgg[0] ? parseFloat(cogsTodayAgg[0].totalCogs.toString()) : 0;
  const purchasesToday = purchasesTodayAgg[0] ? parseFloat(purchasesTodayAgg[0].total.toString()) : 0;
  const expensesToday = expensesTodayAgg[0] ? parseFloat(expensesTodayAgg[0].total.toString()) : 0;
  const profitToday = salesToday - cogsToday - expensesToday;

  return {
    salesToday,
    purchasesToday,
    profitToday,
    totalCustomers,
    totalProducts,
    lowStockProducts: lowStockAgg[0]?.count || 0,
    outOfStockProducts: outOfStockAgg
  };
};

const getDashboardCharts = async () => {
  const now = new Date();

  // 1. Sales Trend (Last 30 Days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const salesTrendAgg = await Sale.aggregate([
    { $match: { saleDate: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
        totalSales: { $sum: "$subTotal" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const salesTrend = salesTrendAgg.map(item => ({
    date: item._id,
    amount: parseFloat(item.totalSales.toString())
  }));

  // 2. Monthly Revenue (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevAgg = await Sale.aggregate([
    { $match: { saleDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$saleDate" }, month: { $month: "$saleDate" } },
        totalRevenue: { $sum: "$subTotal" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = monthlyRevAgg.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    revenue: parseFloat(item.totalRevenue.toString())
  }));

  // 3. Top Selling Products
  const topProductsAgg = await SaleItem.aggregate([
    {
      $group: {
        _id: "$productId",
        totalQuantitySold: { $sum: "$quantity" },
        totalRevenue: { $sum: "$totalPrice" }
      }
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        name: "$product.name",
        quantity: "$totalQuantitySold",
        revenue: "$totalRevenue"
      }
    }
  ]);

  const topSellingProducts = topProductsAgg.map(item => ({
    name: item.name,
    quantity: item.quantity,
    revenue: parseFloat(item.revenue.toString())
  }));

  return {
    salesTrend,
    monthlyRevenue,
    topSellingProducts
  };
};

module.exports = {
  getDashboardStats,
  getDashboardCharts
};
