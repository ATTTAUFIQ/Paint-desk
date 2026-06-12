const Joi = require('joi');

const saleItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  gstPercentage: Joi.number().min(0).required(),
  gstAmount: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
});

const createSaleSchema = Joi.object({
  invoiceNumber: Joi.string().required().trim(),
  customerId: Joi.string().required(),
  saleDate: Joi.date().iso().required(),
  subTotal: Joi.number().min(0).required(),
  totalDiscount: Joi.number().min(0).default(0),
  totalGst: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0).required(),
  amountPaid: Joi.number().min(0).required(),
  items: Joi.array().items(saleItemSchema).min(1).required(),
});

module.exports = {
  createSaleSchema,
};
