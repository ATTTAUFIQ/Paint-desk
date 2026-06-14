const Joi = require('joi');

const recordPaymentSchema = Joi.object({
  partyType: Joi.string().valid('Customer', 'Dealer').required(),
  partyId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().optional().default(() => new Date()),
  paymentMethod: Joi.string().valid('Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Other').required(),
  referenceNumber: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
});

const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  paymentDate: Joi.date().optional(),
  paymentMethod: Joi.string().valid('Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Other').optional(),
  referenceNumber: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
});

module.exports = {
  recordPaymentSchema,
  updatePaymentSchema,
};
