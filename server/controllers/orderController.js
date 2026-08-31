import { storeService } from '../services/storeService.js';
import { sendEmail } from '../config/email.js';

export const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, coupon, subtotal, deliveryFee, tax, discount, totalAmount } = req.body;

    if (!restaurantId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Invalid order request parameters' });
    }

    // Validate item stock availability and prices server-side
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const foodId = item.food?._id || item.foodId || item.food;
      const foodObj = storeService.getFoodById(foodId);

      if (foodObj) {
        if (foodObj.isAvailable === false) {
          return res.status(400).json({
            success: false,
            message: `Item "${foodObj.name}" is currently sold out or unavailable.`,
          });
        }
        const itemPrice = foodObj.discountPrice || foodObj.price;
        const qty = Number(item.quantity || 1);
        calculatedSubtotal += itemPrice * qty;

        validatedItems.push({
          food: foodObj._id,
          name: foodObj.name,
          price: itemPrice,
          quantity: qty,
          image: foodObj.image,
        });
      } else {
        // Fallback for custom item objects
        const itemPrice = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        calculatedSubtotal += itemPrice * qty;

        validatedItems.push({
          food: foodId,
          name: item.name || item.food?.name || 'Food Item',
          price: itemPrice,
          quantity: qty,
          image: item.image || item.food?.image || '',
        });
      }
    }

    const calculatedDeliveryFee = deliveryFee !== undefined ? Number(deliveryFee) : (calculatedSubtotal > 500 ? 0 : 40);
    const calculatedTax = Math.round(calculatedSubtotal * 0.05);
    const calculatedDiscount = Number(discount || 0);
    const finalTotal = Math.max(0, calculatedSubtotal + calculatedDeliveryFee + calculatedTax - calculatedDiscount);

    const orderData = {
      user: req.user._id,
      restaurant: restaurantId,
      items: validatedItems,
      deliveryAddress,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      tax: calculatedTax,
      discount: calculatedDiscount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      coupon,
    };

    const newOrder = storeService.createOrder(orderData);
    const populated = storeService.populateOrder(newOrder);

    // Create Notification for Customer
    storeService.createNotification(
      req.user._id,
      'Order Placed! 🍴',
      `Your order #${populated.orderId} for ₹${populated.totalAmount} has been placed successfully!`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Create Notification for Restaurant Owner
    const restaurant = populated.restaurantDetails;
    if (restaurant && restaurant.owner) {
      storeService.createNotification(
        restaurant.owner,
        'New Incoming Order! 🛎️',
        `New order #${populated.orderId} received (₹${populated.totalAmount}). Items: ${populated.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}.`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    // Emit Socket events to all 3 stakeholders (Customer, Kitchen, Delivery Fleet)
    const io = req.app.get('io');
    if (io) {
      io.emit('orderPlaced', populated);
      io.emit('orderStatusChanged', populated);
      io.to(`restaurant_${restaurantId}`).emit('newOrder', populated);
      io.to(`restaurant_${restaurantId}`).emit('orderStatusChanged', populated);
      io.to('delivery_partners').emit('newDeliveryAvailable', populated);
      io.emit('newDeliveryAvailable', populated);
    }

    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - #${populated.orderId} | FoodRush`,
      text: `Thank you for ordering with FoodRush! Your order #${populated.orderId} is being prepared.`,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...populated,
        order: populated,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'customer') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'restaurant_owner') {
      const myRestaurants = storeService.getRestaurants().filter((r) => r.owner === req.user._id);
      if (myRestaurants.length > 0) {
        filter.restaurantIds = myRestaurants.map((r) => r._id);
      } else {
        // Fallback for owner view to show all restaurant orders
        filter = {};
      }
    } else if (req.user.role === 'delivery_partner') {
      filter.deliveryPartnerId = req.user._id;
    }

    const orders = storeService.getOrders(filter);
    const populated = orders.map((o) => storeService.populateOrder(o));
    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const order = storeService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const populated = storeService.populateOrder(order);
    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, deliveryPartnerId } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status required' });

    const partnerToSet =
      deliveryPartnerId !== undefined
        ? deliveryPartnerId
        : req.user.role === 'delivery_partner'
        ? req.user._id
        : undefined;

    const updatedOrder = storeService.updateOrderStatus(req.params.id, status, note, partnerToSet);
    if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const populated = storeService.populateOrder(updatedOrder);

    // Notify Customer
    storeService.createNotification(
      populated.user,
      `Order Update: ${status} 🛵`,
      `Order #${populated.orderId} status changed to ${status.replace(/_/g, ' ')}.`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Notify Restaurant Owner if updated by rider/admin
    const restId = typeof populated.restaurant === 'object' ? populated.restaurant?._id : populated.restaurant;
    const restaurant = populated.restaurantDetails || storeService.getRestaurantById(restId);
    if (restaurant && restaurant.owner && restaurant.owner !== req.user._id) {
      storeService.createNotification(
        restaurant.owner,
        `Order Update: ${status} 🍳`,
        `Order #${populated.orderId} status updated to ${status.replace(/_/g, ' ')}.`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    // Real-time multi-party socket emission
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

      // If status is READY_FOR_PICKUP or PREPARING and unassigned, notify delivery pool
      if (['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(status) && !populated.deliveryPartner) {
        io.to('delivery_partners').emit('newDeliveryAvailable', populated);
        io.emit('newDeliveryAvailable', populated);
      }
    }

    res.json({ success: true, message: `Order status updated to ${status}`, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = storeService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled' });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This order can no longer be cancelled as it is already with the delivery partner',
      });
    }

    const reason = req.body?.reason || 'Order cancelled by customer';
    const updated = storeService.updateOrderStatus(order._id, 'CANCELLED', reason);
    const populated = storeService.populateOrder(updated);

    // Notify Customer
    storeService.createNotification(
      populated.user,
      'Order Cancelled ❌',
      `Order #${populated.orderId} was cancelled. Reason: ${reason}`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Notify Restaurant
    const restId = typeof populated.restaurant === 'object' ? populated.restaurant?._id : populated.restaurant;
    const restaurant = populated.restaurantDetails || storeService.getRestaurantById(restId);
    if (restaurant && restaurant.owner) {
      storeService.createNotification(
        restaurant.owner,
        'Order Cancelled ❌',
        `Customer cancelled Order #${populated.orderId}. Reason: ${reason}`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    // Real-time socket emission
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

    res.json({ success: true, message: 'Order cancelled successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
