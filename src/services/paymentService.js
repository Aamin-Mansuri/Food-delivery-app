import API from './api';

export const paymentService = {
  verifyPayment: (data) => API.post('/payments/verify', data),
};
