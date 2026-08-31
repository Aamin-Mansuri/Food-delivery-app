import express from 'express';
import { getRestaurantReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.post('/', protect, createReview);

export default router;
