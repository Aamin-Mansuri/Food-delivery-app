import express from 'express';
import { toggleFavoriteRestaurant, toggleFavoriteFood, getFavorites } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/restaurant', protect, toggleFavoriteRestaurant);
router.post('/food', protect, toggleFavoriteFood);

export default router;
