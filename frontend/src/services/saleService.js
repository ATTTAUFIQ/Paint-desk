import api from './api';

const saleService = {
  getSales: async (params) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getSaleById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  createSale: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  cancelSale: async (id) => {
    const response = await api.post(`/sales/${id}/cancel`);
    return response.data;
  },

  updateSale: async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data;
  },
};

export default saleService;
