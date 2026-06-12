import api from './api';

const stockService = {
  getStockMetrics: async () => {
    const response = await api.get('/stock/metrics');
    return response.data;
  },

  getMovements: async (params) => {
    const response = await api.get('/stock/movements', { params });
    return response.data;
  },

  adjustStock: async (data) => {
    const response = await api.post('/stock/adjust', data);
    return response.data;
  },
};

export default stockService;
