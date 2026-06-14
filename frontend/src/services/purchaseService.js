import api from './api';

const purchaseService = {
  getPurchases: async (params) => {
    const response = await api.get('/purchases', { params });
    return response.data;
  },

  getPurchaseById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  createPurchase: async (data) => {
    const response = await api.post('/purchases', data);
    return response.data;
  },

  cancelPurchase: async (id) => {
    const response = await api.post(`/purchases/${id}/cancel`);
    return response.data;
  },

  updatePurchase: async (id, data) => {
    const response = await api.put(`/purchases/${id}`, data);
    return response.data;
  },
};

export default purchaseService;
