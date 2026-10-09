import API from './api';

export const addressService = {
  getAddresses: () => API.get('/addresses'),
  createAddress: (data) => API.post('/addresses', data),
  updateAddress: (id, data) => API.put(`/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/addresses/${id}`),
};
