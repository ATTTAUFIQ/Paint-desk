const Expense = require('../models/Expense');
const mongoose = require('mongoose');

const createExpense = async (expenseData) => {
  const expense = new Expense(expenseData);
  await expense.save();
  return expense;
};

const updateExpense = async (id, expenseData) => {
  const expense = await Expense.findByIdAndUpdate(id, expenseData, { new: true, runValidators: true });
  if (!expense) throw new Error('Expense not found');
  return expense;
};

const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) throw new Error('Expense not found');
  return expense;
};

const getExpenses = async (query = {}) => {
  const { search, category, startDate, endDate, page = 1, limit = 10 } = query;
  
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getExpenseStats = async (query = {}) => {
  const { month, year } = query;
  
  const matchFilter = {};
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    matchFilter.expenseDate = { $gte: start, $lte: end };
  } else {
    // Default to current month if not provided
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    matchFilter.expenseDate = { $gte: start, $lte: end };
  }

  const stats = await Expense.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  // Format into a more usable object
  const breakdown = {
    'Rent': 0,
    'Electricity': 0,
    'Transportation': 0,
    'Miscellaneous': 0
  };
  
  let grandTotal = 0;

  stats.forEach(stat => {
    const val = parseFloat(stat.totalAmount.toString());
    breakdown[stat._id] = val;
    grandTotal += val;
  });

  return { breakdown, grandTotal };
};

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  getExpenseStats
};
