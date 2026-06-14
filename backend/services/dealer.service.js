const Dealer = require('../models/Dealer');

const createDealer = async (dealerData) => {
  const dealer = new Dealer(dealerData);
  return await dealer.save();
};

const getDealers = async (query = {}) => {
  const { search, page = 1, limit = 10 } = query;
  
  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobileNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [dealers, total] = await Promise.all([
    Dealer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Dealer.countDocuments(filter),
  ]);

  return {
    dealers,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getDealerById = async (id) => {
  const dealer = await Dealer.findById(id);
  if (!dealer || !dealer.isActive) {
    throw new Error('Dealer not found');
  }
  return dealer;
};

const updateDealer = async (id, updateData) => {
  const dealer = await Dealer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!dealer) {
    throw new Error('Dealer not found');
  }
  return dealer;
};

const deleteDealer = async (id) => {
  const dealer = await Dealer.findByIdAndDelete(id);
  if (!dealer) {
    throw new Error('Dealer not found');
  }
  return dealer;
};

module.exports = {
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
};
