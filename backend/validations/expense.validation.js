const Joi = require('joi');

const expenseSchema = Joi.object({
  title: Joi.string().required().trim(),
  category: Joi.string().valid('Rent', 'Electricity', 'Transportation', 'Miscellaneous').required(),
  description: Joi.string().allow('').trim(),
  amount: Joi.number().min(0.01).required(),
  expenseDate: Joi.date().iso().required(),
});

module.exports = {
  expenseSchema,
};
