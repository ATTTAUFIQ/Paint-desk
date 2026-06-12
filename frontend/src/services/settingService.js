import api from './api';

const settingService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },

  uploadImages: async (formData) => {
    // Requires Content-Type: multipart/form-data
    const response = await api.post('/settings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default settingService;
