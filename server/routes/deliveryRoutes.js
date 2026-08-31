import express from 'express';
import {
  getDeliveryProfile,
  toggleOnlineStatus,
  getAvailableOrders,
  getMyDeliveries,
  acceptDelivery,
  updateDeliveryStatus,
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Role-protected routes for Delivery Partners and Admins
router.get('/profile', protect, authorize('delivery_partner', 'admin'), getDeliveryProfile);
router.patch('/toggle-online', protect, authorize('delivery_partner', 'admin'), toggleOnlineStatus);
router.get('/available-orders', protect, authorize('delivery_partner', 'admin'), getAvailableOrders);
router.get('/my-orders', protect, authorize('delivery_partner', 'admin'), getMyDeliveries);
router.post('/accept/:orderId', protect, authorize('delivery_partner', 'admin'), acceptDelivery);
router.patch('/update-status/:orderId', protect, authorize('delivery_partner', 'admin'), updateDeliveryStatus);

export default router;


