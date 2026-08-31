import API from './api';

export const foodService = {
  getFoods: (params) => API.get('/foods', { params }),
  getAllFoods: (params) => API.get('/foods', { params }),
  getFoodDetails: (id) => API.get(`/foods/${id}`),
  createFood: (data) =>
    API.post('/foods', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  updateFood: (id, data) =>
    API.put(`/foods/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  toggleAvailability: (id, isAvailable) => API.patch(`/foods/${id}/toggle-availability`, { isAvailable }),
  deleteFood: (id) => API.delete(`/foods/${id}`),
};
