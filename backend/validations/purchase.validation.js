const Joi = require('joi');

const purchaseItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  gstPercentage: Joi.number().min(0).required(),
  gstAmount: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
});

const createPurchaseSchema = Joi.object({
  purchaseNumber: Joi.string().required().trim(),
  dealerId: Joi.string().required(),
  purchaseDate: Joi.date().iso().required(),
  subTotal: Joi.number().min(0).required(),
  totalGst: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0).required(),
  items: Joi.array().items(purchaseItemSchema).min(1).required(),
});

module.exports = {
  createPurchaseSchema,
};
