import express from 'express';
import { createOrder, getOrders, getOrderDetails, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderDetails);
router.patch('/:id/status', protect, updateOrderStatus);
router.post('/:id/cancel', protect, cancelOrder);

export default router;
