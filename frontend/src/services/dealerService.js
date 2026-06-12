import api from './api';

const dealerService = {
  getDealers: async (params) => {
    const response = await api.get('/dealers', { params });
    return response.data;
  },

  getDealerById: async (id) => {
    const response = await api.get(`/dealers/${id}`);
    return response.data;
  },

  createDealer: async (data) => {
    const response = await api.post('/dealers', data);
    return response.data;
  },

  updateDealer: async (id, data) => {
    const response = await api.put(`/dealers/${id}`, data);
    return response.data;
  },

  deleteDealer: async (id) => {
    const response = await api.delete(`/dealers/${id}`);
    return response.data;
  },
};

export default dealerService;
