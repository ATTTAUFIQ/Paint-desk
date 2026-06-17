const express = require('express');
const router = express.Router();
const { checkModuleAccess } = require('../middleware/license');
router.use(checkModuleAccess('expenses'));
const expenseController = require('../controllers/expense.controller');

router.get('/stats', expenseController.getExpenseStats);
router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
