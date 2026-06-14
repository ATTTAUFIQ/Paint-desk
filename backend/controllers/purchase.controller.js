const purchaseService = require('../services/purchase.service');
const { createPurchaseSchema } = require('../validations/purchase.validation');

const createPurchase = async (req, res) => {
  try {
    const { error, value } = createPurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const purchase = await purchaseService.createPurchase(value);
    res.status(201).json({ success: true, data: purchase, message: 'Purchase created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Purchase number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPurchases = async (req, res) => {
  try {
    const result = await purchaseService.getPurchases(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const cancelPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.cancelPurchase(req.params.id);
    res.status(200).json({ success: true, data: purchase, message: 'Purchase cancelled successfully and stock reverted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const { updatePurchaseSchema } = require('../validations/purchase.validation');
    const { error, value } = updatePurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const purchase = await purchaseService.updatePurchase(req.params.id, value);
    res.status(200).json({ success: true, data: purchase, message: 'Purchase updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Purchase number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  cancelPurchase,
  updatePurchase,
};
