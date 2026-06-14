const saleService = require('../services/sale.service');
const { createSaleSchema, updateSaleSchema } = require('../validations/sale.validation');

const createSale = async (req, res) => {
  try {
    const { error, value } = createSaleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const sale = await saleService.createSale(value);
    res.status(201).json({ success: true, data: sale, message: 'Sale created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const result = await saleService.getSales(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const cancelSale = async (req, res) => {
  try {
    const sale = await saleService.cancelSale(req.params.id);
    res.status(200).json({ success: true, data: sale, message: 'Sale cancelled successfully and stock reverted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const { error, value } = updateSaleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const sale = await saleService.updateSale(req.params.id, value);
    res.status(200).json({ success: true, data: sale, message: 'Sale updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  cancelSale,
  updateSale,
};
