import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  toggleApproveRestaurant,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
  deleteCoupon,
  toggleCouponActive,
  getPlatformAnalytics,
  getMongoAtlasStatus,
  syncToMongoAtlas,
  testMongoAtlasConnection,
  connectMongoAtlasUri,
  exportDataSnapshot,
  restoreDataSnapshot,
  toggleAtlasAutoSync,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/analytics', protect, authorize('admin'), getPlatformAnalytics);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/block', protect, authorize('admin'), toggleBlockUser);
router.patch('/restaurants/:id/approve', protect, authorize('admin'), toggleApproveRestaurant);
router.get('/delivery-partners', protect, authorize('admin'), getDeliveryPartners);
router.patch('/delivery-partners/:id', protect, authorize('admin'), updateDeliveryPartnerStatus);
router.delete('/coupons/:id', protect, authorize('admin'), deleteCoupon);
router.patch('/coupons/:id/toggle', protect, authorize('admin'), toggleCouponActive);

// MongoDB Atlas Backup & Synchronization Endpoints
router.get('/backup/status', protect, authorize('admin'), getMongoAtlasStatus);
router.post('/backup/sync', protect, authorize('admin'), syncToMongoAtlas);
router.post('/backup/test-connection', protect, authorize('admin'), testMongoAtlasConnection);
router.post('/backup/connect', protect, authorize('admin'), connectMongoAtlasUri);
router.get('/backup/export', protect, authorize('admin'), exportDataSnapshot);
router.post('/backup/restore', protect, authorize('admin'), restoreDataSnapshot);
router.post('/backup/auto-sync-toggle', protect, authorize('admin'), toggleAtlasAutoSync);

export default router;

