const reportService = require('../services/report.service');

const getReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let result;
    switch (type) {
      case 'sales':
        result = await reportService.getSalesReport(startDate, endDate);
        break;
      case 'purchases':
        result = await reportService.getPurchaseReport(startDate, endDate);
        break;
      case 'expenses':
        result = await reportService.getExpenseReport(startDate, endDate);
        break;
      case 'profit':
        result = await reportService.getProfitReport(startDate, endDate);
        break;
      case 'customers':
        result = await reportService.getCustomerOutstanding();
        break;
      case 'dealers':
        result = await reportService.getDealerOutstanding();
        break;
      case 'stock':
        result = await reportService.getStockReport();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReport
};
