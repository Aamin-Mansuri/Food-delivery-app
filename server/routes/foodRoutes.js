import express from 'express';
import { getFoods, getFoodDetails, createFood, updateFood, toggleFoodAvailability, deleteFood } from '../controllers/foodController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/:id', getFoodDetails);
router.post('/', protect, authorize('restaurant_owner', 'admin'), upload.single('image'), createFood);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), upload.single('image'), updateFood);
router.patch('/:id/toggle-availability', protect, authorize('restaurant_owner', 'admin'), toggleFoodAvailability);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteFood);

export default router;

