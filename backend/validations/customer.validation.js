const Joi = require('joi');

const createCustomerSchema = Joi.object({
  name: Joi.string().required().trim(),
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
  }),
  address: Joi.string().allow('', null).trim(),
  gstNumber: Joi.string().allow('', null).trim(),
  outstandingBalance: Joi.number().default(0),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().trim(),
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
  }),
  address: Joi.string().allow('', null).trim(),
  gstNumber: Joi.string().allow('', null).trim(),
  outstandingBalance: Joi.number(),
}).min(1);

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};
