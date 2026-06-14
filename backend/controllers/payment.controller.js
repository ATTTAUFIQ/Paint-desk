const paymentService = require('../services/payment.service');
const { recordPaymentSchema, updatePaymentSchema } = require('../validations/payment.validation');

const recordPayment = async (req, res) => {
  try {
    const { error, value } = recordPaymentSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const payment = await paymentService.recordPayment(value);
    res.status(201).json({ success: true, data: payment, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentsByParty = async (req, res) => {
  try {
    const { partyType, partyId } = req.params;
    const payments = await paymentService.getPaymentsByParty(partyType, partyId);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updatePaymentSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const payment = await paymentService.updatePayment(id, value);
    res.status(200).json({ success: true, data: payment, message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await paymentService.deletePayment(id);
    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  recordPayment,
  getPaymentsByParty,
  updatePayment,
  deletePayment,
};
