import api from './api';

const reportService = {
  getReport: async (type, params) => {
    const response = await api.get(`/reports/${type}`, { params });
    return response.data;
  }
};

export default reportService;
