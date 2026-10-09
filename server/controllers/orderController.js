import { storeService } from '../services/storeService.js';
import { sendEmail } from '../config/email.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, coupon, subtotal, deliveryFee, tax, discount, totalAmount } = req.body;

    if (!restaurantId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'restaurantId, items, and deliveryAddress are required' });
    }

    // Validate each item and calculate price server-side
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const foodId = item.food?._id || item.foodId || item.food;
      const foodObj = storeService.getFoodById(foodId);

      if (foodObj) {
        if (foodObj.isAvailable === false) {
          return res.status(400).json({
            success: false,
            message: `Item "${foodObj.name}" is currently unavailable.`,
          });
        }
        const itemPrice = foodObj.discountPrice > 0 ? foodObj.discountPrice : foodObj.price;
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
        // Accept custom item objects when food ID is not in store (e.g. new items)
        const itemPrice = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        calculatedSubtotal += itemPrice * qty;

        validatedItems.push({
          food: foodId || 'unknown',
          name: item.name || item.food?.name || 'Food Item',
          price: itemPrice,
          quantity: qty,
          image: item.image || item.food?.image || '',
        });
      }
    }

    // Calculate fees
    const calculatedDeliveryFee = deliveryFee !== undefined ? Number(deliveryFee) : (calculatedSubtotal > 500 ? 0 : 40);
    const calculatedTax = Math.round(calculatedSubtotal * 0.05); // 5% GST
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

    // Notify the customer
    storeService.createNotification(
      req.user._id,
      'Order Placed! 🍴',
      `Your order #${populated.orderId} for ₹${populated.totalAmount} has been placed!`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Notify the restaurant owner
    const restaurant = populated.restaurantDetails;
    if (restaurant?.owner) {
      storeService.createNotification(
        restaurant.owner,
        'New Order! 🛎️',
        `New order #${populated.orderId} received (₹${populated.totalAmount}).`,
        'ORDER_UPDATE',
        `/restaurant/dashboard`
      );
    }

    // Emit real-time events via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('newOrder', populated);
      io.to('delivery_partners').emit('newDeliveryAvailable', populated);
      io.emit('orderStatusChanged', populated);
    }

    // Send confirmation email
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - #${populated.orderId} | FoodRush`,
      text: `Your order #${populated.orderId} has been placed successfully!`,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populated,
    });
  } catch (error) {
    console.error('[orderController] createOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders (filtered by the logged-in user's role)
export const getOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'restaurant_owner') {
      const myRestaurants = storeService.getRestaurants().filter(
        (r) => String(r.owner) === String(req.user._id)
      );
      if (myRestaurants.length > 0) {
        filter.restaurantIds = myRestaurants.map((r) => r._id);
      }
    } else if (req.user.role === 'delivery_partner') {
      filter.deliveryPartnerId = req.user._id;
    }
    // admin sees all orders (no filter)

    const orders = storeService.getOrders(filter);
    const populated = orders.map((o) => storeService.populateOrder(o));
    res.json({ success: true, count: populated.length, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single order by ID
export const getOrderDetails = async (req, res) => {
  try {
    const order = storeService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const populated = storeService.populateOrder(order);
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (restaurant owner, delivery partner, or admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, deliveryPartnerId } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'status field is required' });

    // Determine which delivery partner to assign
    const partnerToSet =
      deliveryPartnerId !== undefined
        ? deliveryPartnerId
        : req.user.role === 'delivery_partner'
        ? req.user._id
        : undefined;

    const updatedOrder = storeService.updateOrderStatus(req.params.id, status, note, partnerToSet);
    if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const populated = storeService.populateOrder(updatedOrder);

    // Notify customer of status change
    storeService.createNotification(
      populated.user,
      `Order ${status} 🛵`,
      `Your order #${populated.orderId} is now: ${status.replace(/_/g, ' ')}.`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${populated._id}`).emit('orderStatusChanged', populated);
      io.emit('orderStatusChanged', populated);

      // Alert delivery pool when order is ready for pickup
      if (['PLACED', 'CONFIRMED', 'READY_FOR_PICKUP'].includes(status) && !populated.deliveryPartner) {
        io.to('delivery_partners').emit('newDeliveryAvailable', populated);
      }
    }

    res.json({ success: true, message: `Order status updated to ${status}`, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const order = storeService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled — it is already with the delivery partner',
      });
    }

    const reason = req.body?.reason || 'Cancelled by customer';
    const updated = storeService.updateOrderStatus(order._id, 'CANCELLED', reason);
    const populated = storeService.populateOrder(updated);

    // Notify customer and restaurant
    storeService.createNotification(
      populated.user,
      'Order Cancelled ❌',
      `Order #${populated.orderId} cancelled. Reason: ${reason}`,
      'ORDER_UPDATE',
      `/orders/${populated._id}`
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${populated._id}`).emit('orderStatusChanged', populated);
      io.emit('orderStatusChanged', populated);
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
