import API from './api';

export const deliveryService = {
  getProfile: () => API.get('/delivery/profile'),
  toggleOnline: () => API.patch('/delivery/toggle-online'),
  getAvailableOrders: () => API.get('/delivery/available-orders'),
  getMyOrders: () => API.get('/delivery/my-orders'),
  acceptDelivery: (orderId) => API.post(`/delivery/accept/${orderId}`),
  updateStatus: (orderId, status) => API.patch(`/delivery/update-status/${orderId}`, { status }),
};

