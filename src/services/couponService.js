import API from './api';

export const couponService = {
  getCoupons: () => API.get('/coupons'),
  validateCoupon: (data) => API.post('/coupons/validate', data),
  createCoupon: (data) => API.post('/coupons', data),
};
