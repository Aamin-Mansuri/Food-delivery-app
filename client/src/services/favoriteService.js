import API from './api';

export const favoriteService = {
  getFavorites: () => API.get('/favorites'),
  toggleFavoriteRestaurant: (restaurantId) => API.post('/favorites/restaurant', { restaurantId }),
  toggleFavoriteFood: (foodId) => API.post('/favorites/food', { foodId }),
};
