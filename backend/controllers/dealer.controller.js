const dealerService = require('../services/dealer.service');
const { createDealerSchema, updateDealerSchema } = require('../validations/dealer.validation');

const createDealer = async (req, res) => {
  try {
    const { error, value } = createDealerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const dealer = await dealerService.createDealer(value);
    res.status(201).json({ success: true, data: dealer, message: 'Dealer created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDealers = async (req, res) => {
  try {
    const result = await dealerService.getDealers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDealerById = async (req, res) => {
  try {
    const dealer = await dealerService.getDealerById(req.params.id);
    res.status(200).json({ success: true, data: dealer });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateDealer = async (req, res) => {
  try {
    const { error, value } = updateDealerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const dealer = await dealerService.updateDealer(req.params.id, value);
    res.status(200).json({ success: true, data: dealer, message: 'Dealer updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDealer = async (req, res) => {
  try {
    await dealerService.deleteDealer(req.params.id);
    res.status(200).json({ success: true, message: 'Dealer deleted successfully' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
};
