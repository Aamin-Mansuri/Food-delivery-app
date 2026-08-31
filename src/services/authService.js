import API from './api';

export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  sendOTP: (data) => API.post('/auth/send-otp', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  updateProfile: (formData) => API.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
