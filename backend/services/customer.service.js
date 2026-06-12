const Customer = require('../models/Customer');

const createCustomer = async (customerData) => {
  const customer = new Customer(customerData);
  return await customer.save();
};

const getCustomers = async (query = {}) => {
  const { search, page = 1, limit = 10 } = query;
  
  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobileNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer || !customer.isActive) {
    throw new Error('Customer not found');
  }
  return customer;
};

const updateCustomer = async (id, updateData) => {
  const customer = await Customer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
