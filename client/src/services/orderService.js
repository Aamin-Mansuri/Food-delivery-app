import API from './api';

export const orderService = {
  createOrder: (data) => API.post('/orders', data),
  getOrders: () => API.get('/orders'),
  getOrderDetails: (id) => API.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => API.patch(`/orders/${id}/status`, data),
  cancelOrder: (id, data = {}) => API.post(`/orders/${id}/cancel`, data),
};
