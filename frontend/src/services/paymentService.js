import api from './api';

const paymentService = {
  recordPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPaymentsByParty: async (partyType, partyId) => {
    try {
      const response = await api.get(`/payments/party/${partyType}/${partyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePayment: async (paymentId, paymentData) => {
    try {
      const response = await api.put(`/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const response = await api.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentService;
