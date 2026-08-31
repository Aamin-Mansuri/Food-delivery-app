import axios from 'axios';

// Create Central Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('foodrush_token') ||
      localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Data & Global Errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodrush_token');
      localStorage.removeItem('foodrush_user');
      localStorage.removeItem('token');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Server communication error';

    return Promise.reject(new Error(message));
  }
);

export const apiClient = api;
export default api;
