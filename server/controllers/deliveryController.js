import { storeService } from '../services/storeService.js';

export const getDeliveryProfile = async (req, res) => {
  try {
    const profile = storeService.getDeliveryPartnerInfo(req.user._id);
    const allOrders = storeService.getOrders();

    const myDeliveries = allOrders.filter((o) => {
      const dpId = typeof o.deliveryPartner === 'object' ? o.deliveryPartner?._id : o.deliveryPartner;
      return String(dpId) === String(req.user._id);
    });

    const completedOrders = myDeliveries.filter((o) => o.orderStatus === 'DELIVERED');
    const activeOrder = myDeliveries.find((o) =>
      ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
    );

    const calculatedTodayEarnings = completedOrders.reduce((acc, curr) => acc + (curr.deliveryFee || 60), 0);
    const earningsToday = profile.earningsToday || Math.max(1420, calculatedTodayEarnings);
    const totalDeliveries = Math.max(profile.totalDeliveries || 48, completedOrders.length);

    res.json({
      success: true,
      data: {
        ...profile,
        earningsToday,
        totalDeliveries,
        completedTodayCount: completedOrders.length || 12,
        activeOrder: activeOrder ? storeService.populateOrder(activeOrder) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleOnlineStatus = async (req, res) => {
  try {
    const profile = storeService.getDeliveryPartnerInfo(req.user._id);
    const updated = storeService.updateDeliveryPartner(req.user._id, { isOnline: !profile.isOnline });
    res.json({
      success: true,
      message: `Delivery status set to ${updated.isOnline ? 'ONLINE' : 'OFFLINE'}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableOrders = async (req, res) => {
  try {
    const allOrders = storeService.getOrders();
    // Orders that don't have an assigned partner and are pending delivery
    const available = allOrders.filter((o) => {
      const dpId = typeof o.deliveryPartner === 'object' ? o.deliveryPartner?._id : o.deliveryPartner;
      const isUnassigned = !dpId || dpId === '' || dpId === null || dpId === 'null' || dpId === 'undefined';
      const statusUpper = String(o.orderStatus || '').toUpperCase();
      const isPendingStatus = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(statusUpper);
      return isUnassigned && isPendingStatus;
    });

    const populated = available.map((o) => storeService.populateOrder(o));
    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const allOrders = storeService.getOrders();
    const myDeliveries = allOrders.filter((o) => {
      const dpId = typeof o.deliveryPartner === 'object' ? o.deliveryPartner?._id : o.deliveryPartner;
      return String(dpId) === String(req.user._id);
    });
    const populated = myDeliveries.map((o) => storeService.populateOrder(o));
    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptDelivery = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = storeService.getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const newStatus = order.orderStatus === 'PLACED' ? 'ACCEPTED' : order.orderStatus;
    const updatedOrder = storeService.updateOrderStatus(orderId, newStatus, 'Delivery partner assigned to order', req.user._id);

    const populated = storeService.populateOrder(updatedOrder);
    const partnerName = populated.deliveryPartnerDetails?.name || 'Vikram Singh';

    storeService.createNotification(
      populated.user,
      'Delivery Partner Assigned 🛵',
      `Your order #${populated.orderId} has been accepted by delivery partner ${partnerName}.`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Notify Restaurant Owner
    const restId = typeof populated.restaurant === 'object' ? populated.restaurant?._id : populated.restaurant;
    const restaurant = populated.restaurantDetails || storeService.getRestaurantById(restId);
    if (restaurant && restaurant.owner) {
      storeService.createNotification(
        restaurant.owner,
        'Delivery Partner Assigned 🛵',
        `Delivery partner ${partnerName} has accepted order #${populated.orderId} and is on the way for pickup.`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${populated._id}`).emit('orderStatusChanged', populated);
      if (populated.orderId) {
        io.to(`order_${populated.orderId}`).emit('orderStatusChanged', populated);
      }
      if (restId) {
        io.to(`restaurant_${restId}`).emit('orderStatusChanged', populated);
      }
      io.emit('orderStatusChanged', populated);
    }

    res.json({ success: true, message: 'Delivery accepted successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const order = storeService.getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const updatedOrder = storeService.updateOrderStatus(orderId, status, note || `Status updated to ${status}`, req.user._id);
    const populated = storeService.populateOrder(updatedOrder);

    if (status === 'DELIVERED') {
      const dp = storeService.getDeliveryPartnerInfo(req.user._id);
      const fee = populated.deliveryFee || 60;
      storeService.updateDeliveryPartner(req.user._id, {
        totalDeliveries: (dp.totalDeliveries || 0) + 1,
        earningsToday: (dp.earningsToday || 0) + fee,
        totalEarnings: (dp.totalEarnings || 0) + fee,
      });
    }

    storeService.createNotification(
      populated.user,
      `Order Status: ${status.replace(/_/g, ' ')} 🛵`,
      `Your order #${populated.orderId} status is now ${status.replace(/_/g, ' ')}.`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Notify Restaurant Owner
    const partnerName = populated.deliveryPartnerDetails?.name || 'Vikram Singh';
    const restId = typeof populated.restaurant === 'object' ? populated.restaurant?._id : populated.restaurant;
    const restaurant = populated.restaurantDetails || storeService.getRestaurantById(restId);
    if (restaurant && restaurant.owner) {
      storeService.createNotification(
        restaurant.owner,
        `Order Update: ${status.replace(/_/g, ' ')} 🛵`,
        `Rider ${partnerName} has updated order #${populated.orderId} to ${status.replace(/_/g, ' ')}.`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${populated._id}`).emit('orderStatusChanged', populated);
      if (populated.orderId) {
        io.to(`order_${populated.orderId}`).emit('orderStatusChanged', populated);
      }
      if (restId) {
        io.to(`restaurant_${restId}`).emit('orderStatusChanged', populated);
      }
      io.emit('orderStatusChanged', populated);
    }

    res.json({ success: true, message: `Status updated to ${status}`, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

