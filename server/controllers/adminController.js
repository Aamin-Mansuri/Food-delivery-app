import { storeService } from '../services/storeService.js';
import { backupService } from '../services/backupService.js';

export const getDashboardStats = async (req, res) => {
  try {
    const stats = storeService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = storeService.getAllUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const user = storeService.findUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = storeService.updateUser(user._id, { isBlocked: !user.isBlocked });
    res.json({ success: true, message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleApproveRestaurant = async (req, res) => {
  try {
    const restaurant = storeService.getRestaurantById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const updated = storeService.updateRestaurant(restaurant._id, { isApproved: !restaurant.isApproved });
    res.json({ success: true, message: `Restaurant ${updated.isApproved ? 'approved' : 'rejected'}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const allUsers = storeService.getAllUsers();
    const dpUsers = allUsers.filter((u) => u.role === 'delivery_partner');
    const allOrders = storeService.getOrders();

    const partners = dpUsers.map((u) => {
      const dpInfo = storeService.getDeliveryPartnerInfo(u._id);
      const partnerOrders = allOrders.filter((o) => {
        const dpId = typeof o.deliveryPartner === 'object' ? o.deliveryPartner?._id : o.deliveryPartner;
        return String(dpId) === String(u._id);
      });
      const activeDelivery = partnerOrders.find((o) =>
        ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
      );

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '+91 9876543210',
        avatar: u.avatar,
        isBlocked: !!u.isBlocked,
        isOnline: dpInfo?.isOnline ?? true,
        vehicleType: dpInfo?.vehicleType || 'Motorcycle',
        vehicleNumber: dpInfo?.vehicleNumber || 'MH-02-FR-1080',
        rating: dpInfo?.rating || 4.8,
        totalDeliveries: Math.max(dpInfo?.totalDeliveries || 0, partnerOrders.filter((o) => o.orderStatus === 'DELIVERED').length),
        earningsToday: dpInfo?.earningsToday || 1420,
        activeDelivery: activeDelivery ? storeService.populateOrder(activeDelivery) : null,
      };
    });

    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline, vehicleType, vehicleNumber } = req.body;
    const updated = storeService.updateDeliveryPartner(id, {
      ...(isOnline !== undefined && { isOnline }),
      ...(vehicleType && { vehicleType }),
      ...(vehicleNumber && { vehicleNumber }),
    });
    res.json({ success: true, message: 'Delivery partner updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const index = storeService.data.coupons.findIndex((c) => c._id === id || String(c._id) === String(id));
    if (index !== -1) {
      const removed = storeService.data.coupons.splice(index, 1)[0];
      res.json({ success: true, message: 'Coupon deleted', data: removed });
    } else {
      res.status(404).json({ success: false, message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCouponActive = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = storeService.data.coupons.find((c) => c._id === id || String(c._id) === String(id));
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    res.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const stats = storeService.getAdminStats();
    const orders = storeService.getOrders();
    const restaurants = storeService.getRestaurants();
    const users = storeService.getAllUsers();

    // Calculate city performance
    const cityMap = {};
    orders.forEach((o) => {
      const city = o.deliveryAddress?.city || 'Mumbai';
      if (!cityMap[city]) {
        cityMap[city] = { city, totalOrders: 0, revenue: 0 };
      }
      cityMap[city].totalOrders += 1;
      cityMap[city].revenue += o.totalAmount || 0;
    });

    const cityPerformance = Object.values(cityMap).length > 0
      ? Object.values(cityMap)
      : [
          { city: 'Mumbai', totalOrders: 740, revenue: 310000 },
          { city: 'Bengaluru', totalOrders: 420, revenue: 175000 },
          { city: 'Delhi NCR', totalOrders: 260, revenue: 95000 },
        ];

    // Hourly peak distribution
    const hourlyDistribution = [
      { hour: '11 AM', orders: 120, label: 'Early Lunch' },
      { hour: '1 PM', orders: 380, label: 'Peak Lunch' },
      { hour: '4 PM', orders: 95, label: 'Snacks' },
      { hour: '7 PM', orders: 290, label: 'Early Dinner' },
      { hour: '9 PM', orders: 495, label: 'Peak Dinner' },
      { hour: '11 PM', orders: 140, label: 'Late Night' },
    ];

    res.json({
      success: true,
      data: {
        ...stats,
        cityPerformance,
        hourlyDistribution,
        totalCuisineBreakdown: [
          { name: 'North Indian & Biryani', percentage: 38, count: 540 },
          { name: 'Pizzas & Burgers', percentage: 26, count: 370 },
          { name: 'South Indian & Tiffin', percentage: 18, count: 255 },
          { name: 'Asian & Chinese', percentage: 12, count: 170 },
          { name: 'Desserts & Shakes', percentage: 6, count: 85 },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MongoDB Atlas Backup & Database Management Handlers
export const getMongoAtlasStatus = async (req, res) => {
  try {
    const status = await backupService.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncToMongoAtlas = async (req, res) => {
  try {
    const { uri } = req.body;
    const result = await backupService.syncAllToMongoAtlas({ uri });
    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testMongoAtlasConnection = async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ success: false, message: 'URI string is required' });

    const result = await backupService.testConnection(uri);
    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: `MongoDB Atlas connection failed: ${error.message}` });
  }
};

export const connectMongoAtlasUri = async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ success: false, message: 'URI string is required' });

    const result = await backupService.connectToUri(uri);
    res.json({ success: true, message: 'Connected to MongoDB Atlas database successfully', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportDataSnapshot = async (req, res) => {
  try {
    const snapshot = backupService.exportSnapshot();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="foodrush_backup_${Date.now()}.json"`);
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreDataSnapshot = async (req, res) => {
  try {
    const { snapshot, syncAtlas } = req.body;
    if (!snapshot) {
      return res.status(400).json({ success: false, message: 'Snapshot data is required' });
    }

    const result = await backupService.restoreSnapshot(snapshot, syncAtlas !== false);
    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAtlasAutoSync = async (req, res) => {
  try {
    const { enabled } = req.body;
    const result = backupService.setAutoSync(enabled);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

