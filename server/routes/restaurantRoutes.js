import express from 'express';
import {
  getRestaurants,
  getRestaurantDetails,
  createRestaurant,
  updateRestaurant,
  toggleRestaurantOpen,
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantDetails);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateRestaurant);
router.patch('/:id/toggle-open', protect, authorize('restaurant_owner', 'admin'), toggleRestaurantOpen);

export default router;

