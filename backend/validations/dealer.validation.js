const Joi = require('joi');

const createDealerSchema = Joi.object({
  name: Joi.string().required().trim(),
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
  }),
  address: Joi.string().allow('', null).trim(),
  gstNumber: Joi.string().allow('', null).trim(),
  pendingBalance: Joi.number().default(0),
});

const updateDealerSchema = Joi.object({
  name: Joi.string().trim(),
  mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).messages({
    'string.pattern.base': 'Mobile number must be exactly 10 digits',
  }),
  address: Joi.string().allow('', null).trim(),
  gstNumber: Joi.string().allow('', null).trim(),
  pendingBalance: Joi.number(),
}).min(1);

module.exports = {
  createDealerSchema,
  updateDealerSchema,
};
