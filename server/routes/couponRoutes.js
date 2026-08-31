import express from 'express';
import { getCoupons, validateCoupon, createCoupon } from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getCoupons);
router.post('/validate', protect, validateCoupon);
router.post('/', protect, authorize('admin'), createCoupon);

export default router;
