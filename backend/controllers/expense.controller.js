const expenseService = require('../services/expense.service');
const { expenseSchema } = require('../validations/expense.validation');

const createExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    
    const expense = await expenseService.createExpense(value);
    res.status(201).json({ success: true, data: expense, message: 'Expense logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const expense = await expenseService.updateExpense(req.params.id, value);
    res.status(200).json({ success: true, data: expense, message: 'Expense updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await expenseService.deleteExpense(req.params.id);
    res.status(200).json({ success: true, data: expense, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const result = await expenseService.getExpenses(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExpenseStats = async (req, res) => {
  try {
    const stats = await expenseService.getExpenseStats(req.query);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  getExpenseStats
};
