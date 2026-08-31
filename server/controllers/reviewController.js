import { storeService } from '../services/storeService.js';

export const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = storeService.getReviewsByRestaurant(req.params.restaurantId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { restaurantId, orderId, rating, comment } = req.body;

    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide restaurant, rating (1-5), and review text' });
    }

    const newReview = storeService.createReview({
      user: req.user._id,
      restaurant: restaurantId,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
