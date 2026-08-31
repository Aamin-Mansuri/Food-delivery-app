import API from './api';

export const restaurantService = {
  getRestaurants: (params) => API.get('/restaurants', { params }),
  getRestaurantDetails: (id) => API.get(`/restaurants/${id}`),
  createRestaurant: (data) => API.post('/restaurants', data),
  updateRestaurant: (id, data) => API.put(`/restaurants/${id}`, data),
  toggleOpen: (id) => API.patch(`/restaurants/${id}/toggle-open`),
};
