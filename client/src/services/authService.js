import API from './api';

export const authService = {
  // POST /api/auth/login => { success, data: { user, token, redirectPath } }
  login: (data) => API.post('/auth/login', data),

  // POST /api/auth/register => { success, data: { user, token } }
  register: (data) => API.post('/auth/register', data),

  // GET /api/auth/me => { success, data: { _id, name, email, role, ... } }
  getMe: () => API.get('/auth/me'),

  // POST /api/auth/send-otp
  sendOTP: (data) => API.post('/auth/send-otp', data),

  // POST /api/auth/forgot-password
  forgotPassword: (data) => API.post('/auth/forgot-password', data),

  // POST /api/auth/reset-password
  resetPassword: (data) => API.post('/auth/reset-password', data),

  // PUT /api/users/profile (multipart for avatar)
  updateProfile: (formData) =>
    API.put('/users/profile', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
};
