import API from './api';

export const reviewService = {
  getRestaurantReviews: (restaurantId) => API.get(`/reviews/restaurant/${restaurantId}`),
  createReview: (data) => API.post('/reviews', data),
};
