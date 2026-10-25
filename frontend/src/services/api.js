import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses Vercel environment variable in production
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for graceful network and offline error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response && (
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      (typeof navigator !== 'undefined' && !navigator.onLine)
    );

    if (isNetworkError) {
      error.isOffline = true;
      error.friendlyMessage = 'Unable to reach the server. Please check your internet connection or verify the server is running.';
    }

    return Promise.reject(error);
  }
);

export default api;
