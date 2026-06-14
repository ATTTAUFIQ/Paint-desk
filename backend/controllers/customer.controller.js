const customerService = require('../services/customer.service');
const { createCustomerSchema, updateCustomerSchema } = require('../validations/customer.validation');

const createCustomer = async (req, res) => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const customer = await customerService.createCustomer(value);
    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await customerService.getCustomers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { error, value } = updateCustomerSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const customer = await customerService.updateCustomer(req.params.id, value);
    res.status(200).json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
