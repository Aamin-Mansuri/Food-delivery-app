import API from './api';

export const cartService = {
  getCart: () => API.get('/cart'),
  syncCart: (data) => API.post('/cart/sync', data),
  clearCart: () => API.delete('/cart/clear'),
};
