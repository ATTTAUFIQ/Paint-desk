const stockService = require('../services/stock.service');

const getStockMetrics = async (req, res) => {
  try {
    const metrics = await stockService.getStockMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMovements = async (req, res) => {
  try {
    const result = await stockService.getMovements(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const movement = await stockService.adjustStock(req.body);
    res.status(201).json({ success: true, data: movement, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStockMetrics,
  getMovements,
  adjustStock
};
