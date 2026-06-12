const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Rent', 'Electricity', 'Transportation', 'Miscellaneous'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0.01,
  },
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  // recordedBy is omitted for now as we don't have an auth module
}, { timestamps: true });

// Convert Decimal128 to string for JSON responses
expenseSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.amount) ret.amount = ret.amount.toString();
    return ret;
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
