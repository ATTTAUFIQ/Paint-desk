const Joi = require('joi');

const createProductSchema = Joi.object({
  productCode: Joi.string().required().trim(),
  barcode: Joi.string().trim().allow(null, ''),
  qrCode: Joi.string().trim().allow(null, ''),
  name: Joi.string().required().trim(),
  brand: Joi.string().required(),
  unitType: Joi.string().valid('Ltr', 'Kg', 'Pcs', 'Gal').required(),
  purchasePrice: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(0).required(),
  gstPercentage: Joi.number().min(0).max(100).required(),
  currentStock: Joi.number().min(0).default(0),
  lowStockLimit: Joi.number().min(0).default(10),
  expiryDate: Joi.date().optional().allow(null, ''),
  isActive: Joi.boolean().default(true),
});

const updateProductSchema = Joi.object({
  productCode: Joi.string().trim(),
  barcode: Joi.string().trim().allow(null, ''),
  qrCode: Joi.string().trim().allow(null, ''),
  name: Joi.string().trim(),
  brand: Joi.string(),
  unitType: Joi.string().valid('Ltr', 'Kg', 'Pcs', 'Gal'),
  purchasePrice: Joi.number().min(0),
  sellingPrice: Joi.number().min(0),
  gstPercentage: Joi.number().min(0).max(100),
  currentStock: Joi.number().min(0),
  lowStockLimit: Joi.number().min(0),
  expiryDate: Joi.date().optional().allow(null, ''),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createProductSchema,
  updateProductSchema,
};
