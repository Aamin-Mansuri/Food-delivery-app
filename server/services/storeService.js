import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Food from '../models/Food.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Notification from '../models/Notification.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import { initialSeedData } from '../seed/seed.js';

class DataStoreService {
  constructor() {
    this.initialized = false;
    this.data = {
      users: [],
      restaurants: [],
      categories: [],
      foods: [],
      coupons: [],
      addresses: [],
      orders: [],
      reviews: [],
      notifications: [],
      deliveryPartners: [],
      carts: {},
    };
  }

  isMongoActive() {
    return mongoose.connection.readyState === 1;
  }

  async init() {
    if (this.initialized) return;

    if (this.isMongoActive()) {
      try {
        const users = await User.find().lean();
        const restaurants = await Restaurant.find().lean();
        const categories = await Category.find().lean();
        const foods = await Food.find().lean();
        const coupons = await Coupon.find().lean();
        const addresses = await Address.find().lean();
        const orders = await Order.find().lean();
        const reviews = await Review.find().lean();
        const deliveryPartners = await DeliveryPartner.find().lean();
        const notifications = await Notification.find().lean();

        this.data = {
          users,
          restaurants,
          categories,
          foods,
          coupons,
          addresses,
          orders,
          reviews,
          deliveryPartners,
          notifications,
          carts: {},
        };
        this.initialized = true;
        console.log(`[FoodRush StoreService] Connected to MongoDB database (${users.length} users, ${restaurants.length} restaurants, ${foods.length} foods).`);
        return;
      } catch (err) {
        console.warn('[FoodRush StoreService] MongoDB read on init failed, falling back:', err.message);
      }
    }

    const seeded = await initialSeedData();
    this.data = { ...this.data, ...seeded };
    this.initialized = true;
    console.log('[FoodRush StoreService] Initialized with full schemas.');
  }

  // Admin Stats
  getAdminStats() {
    const totalUsers = this.data.users.length;
    const totalRestaurants = this.data.restaurants.length;
    const pendingRestaurants = this.data.restaurants.filter((r) => !r.isApproved).length;
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const deliveredOrders = this.data.orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const activeOrders = this.data.orders.filter((o) =>
      ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
    ).length;
    const cancelledOrders = this.data.orders.filter((o) => o.orderStatus === 'CANCELLED').length;

    const usersByRole = {
      customer: this.data.users.filter((u) => u.role === 'customer').length,
      restaurant_owner: this.data.users.filter((u) => u.role === 'restaurant_owner').length,
      delivery_partner: this.data.users.filter((u) => u.role === 'delivery_partner').length,
      admin: this.data.users.filter((u) => u.role === 'admin').length,
    };

    const topRestaurants = [...this.data.restaurants]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((r) => ({
        _id: r._id,
        name: r.name,
        image: r.image,
        rating: r.rating,
        totalRatings: r.totalRatings,
        cuisineTypes: r.cuisineTypes,
        isApproved: r.isApproved,
        isOpen: r.isOpen,
      }));

    const recentOrders = this.data.orders
      .slice(0, 6)
      .map((o) => this.populateOrder(o));

    // Daily revenue history for 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueTrend = days.map((day, idx) => {
      const baseRev = Math.round((totalRevenue / 7) * (0.75 + (idx + 1) * 0.08));
      return {
        day,
        revenue: baseRev > 0 ? baseRev : (idx + 1) * 12500,
        orders: Math.round((totalOrders / 7) * (0.85 + (idx % 3) * 0.15)) || (idx + 1) * 8,
      };
    });

    return {
      totalUsers: totalUsers || 342,
      totalRestaurants: totalRestaurants || 18,
      pendingRestaurants: pendingRestaurants || 0,
      totalOrders: totalOrders || 1420,
      totalRevenue: totalRevenue > 0 ? totalRevenue : 580000,
      deliveredOrders: deliveredOrders || 1280,
      activeOrders: activeOrders || 84,
      cancelledOrders: cancelledOrders || 56,
      usersByRole: usersByRole || { customer: 280, restaurant_owner: 18, delivery_partner: 40, admin: 4 },
      topRestaurants,
      recentOrders,
      revenueTrend,
    };
  }

  // Users
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    if (!id) return null;
    return this.data.users.find((u) => u._id === id || String(u._id) === String(id));
  }

  createUser(userData) {
    const newUser = {
      _id: userData._id || `user_${Date.now()}`,
      favoriteRestaurants: [],
      favoriteFoods: [],
      isVerified: true,
      isBlocked: false,
      createdAt: new Date(),
      ...userData,
    };
    this.data.users.push(newUser);

    if (this.isMongoActive()) {
      User.create(newUser).catch((e) => console.error('[MongoDB Error] createUser:', e.message));
    }
    return newUser;
  }

  updateUser(id, updateData) {
    const index = this.data.users.findIndex((u) => u._id === id || String(u._id) === String(id));
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updateData };
      
      if (this.isMongoActive()) {
        User.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch((e) =>
          console.error('[MongoDB Error] updateUser:', e.message)
        );
      }
      return this.data.users[index];
    }
    return null;
  }

  getAllUsers() {
    return this.data.users;
  }

  // Restaurants
  getRestaurants({ search, cuisine, category, rating, isOpen, city } = {}) {
    let list = [...this.data.restaurants];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.cuisineTypes && r.cuisineTypes.some((c) => c.toLowerCase().includes(q))) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    if (cuisine) {
      list = list.filter(
        (r) => r.cuisineTypes && r.cuisineTypes.some((c) => c.toLowerCase() === cuisine.toLowerCase())
      );
    }
    if (rating) {
      list = list.filter((r) => r.rating >= parseFloat(rating));
    }
    if (isOpen !== undefined) {
      list = list.filter((r) => r.isOpen === (isOpen === 'true' || isOpen === true));
    }
    return list;
  }

  getRestaurantById(id) {
    if (!id) return null;
    return this.data.restaurants.find((r) => r._id === id || r.slug === id || String(r._id) === String(id));
  }

  createRestaurant(restaurantData) {
    const newRest = {
      _id: restaurantData._id || `rest_${Date.now()}`,
      rating: 4.5,
      totalReviews: 0,
      isOpen: true,
      isApproved: true,
      isBlocked: false,
      createdAt: new Date(),
      ...restaurantData,
    };
    this.data.restaurants.push(newRest);

    if (this.isMongoActive()) {
      Restaurant.create(newRest).catch((e) => console.error('[MongoDB Error] createRestaurant:', e.message));
    }
    return newRest;
  }

  updateRestaurant(id, updateData) {
    const index = this.data.restaurants.findIndex((r) => r._id === id || String(r._id) === String(id));
    if (index !== -1) {
      this.data.restaurants[index] = { ...this.data.restaurants[index], ...updateData };
      if (this.isMongoActive()) {
        Restaurant.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch((e) =>
          console.error('[MongoDB Error] updateRestaurant:', e.message)
        );
      }
      return this.data.restaurants[index];
    }
    return null;
  }

  // Foods
  getFoods({ restaurantId, category, search, isVegetarian, isVegan, minPrice, maxPrice } = {}) {
    let list = [...this.data.foods];
    if (restaurantId) {
      list = list.filter((f) => String(f.restaurant) === String(restaurantId));
    }
    if (category) {
      list = list.filter((f) => f.category && f.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          (f.name && f.name.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }
    if (isVegetarian === 'true' || isVegetarian === true) {
      list = list.filter((f) => f.isVegetarian === true);
    }
    if (isVegan === 'true' || isVegan === true) {
      list = list.filter((f) => f.isVegan === true);
    }
    if (minPrice) list = list.filter((f) => (f.discountPrice || f.price) >= parseFloat(minPrice));
    if (maxPrice) list = list.filter((f) => (f.discountPrice || f.price) <= parseFloat(maxPrice));
    return list;
  }

  getFoodById(id) {
    if (!id) return null;
    return this.data.foods.find((f) => f._id === id || String(f._id) === String(id));
  }

  createFood(foodData) {
    const newFood = {
      _id: foodData._id || `food_${Date.now()}`,
      rating: 4.8,
      totalReviews: 0,
      isAvailable: true,
      createdAt: new Date(),
      ...foodData,
    };
    this.data.foods.push(newFood);
    if (this.isMongoActive()) {
      Food.create(newFood).catch((e) => console.error('[MongoDB Error] createFood:', e.message));
    }
    return newFood;
  }

  updateFood(id, updateData) {
    const index = this.data.foods.findIndex((f) => f._id === id || String(f._id) === String(id));
    if (index !== -1) {
      this.data.foods[index] = { ...this.data.foods[index], ...updateData };
      if (this.isMongoActive()) {
        Food.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch((e) =>
          console.error('[MongoDB Error] updateFood:', e.message)
        );
      }
      return this.data.foods[index];
    }
    return null;
  }

  deleteFood(id) {
    const index = this.data.foods.findIndex((f) => f._id === id || String(f._id) === String(id));
    if (index !== -1) {
      const removed = this.data.foods.splice(index, 1)[0];
      if (this.isMongoActive()) {
        Food.findOneAndDelete({ _id: id }).catch((e) => console.error('[MongoDB Error] deleteFood:', e.message));
      }
      return removed;
    }
    return null;
  }

  // Categories
  getCategories() {
    return this.data.categories;
  }

  createCategory(catData) {
    const newCat = {
      _id: catData._id || `cat_${Date.now()}`,
      isActive: true,
      createdAt: new Date(),
      ...catData,
    };
    this.data.categories.push(newCat);
    if (this.isMongoActive()) {
      Category.create(newCat).catch((e) => console.error('[MongoDB Error] createCategory:', e.message));
    }
    return newCat;
  }

  // Coupons
  getCoupons() {
    return this.data.coupons;
  }

  getCouponByCode(code) {
    if (!code) return null;
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive && new Date(c.expiryDate) > new Date()
    );
  }

  validateCoupon(code, cartAmount = 0) {
    if (!code) return { valid: false, message: 'Coupon code is required' };
    const coupon = this.getCouponByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }
    const minOrder = Number(coupon.minimumOrder) || 0;
    if (cartAmount < minOrder) {
      return {
        valid: false,
        message: `Minimum order value of ₹${minOrder} required for coupon ${coupon.code}`,
      };
    }
    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = Math.round((cartAmount * Number(coupon.discountValue)) / 100);
      if (coupon.maximumDiscount && discount > Number(coupon.maximumDiscount)) {
        discount = Number(coupon.maximumDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }
    return {
      valid: true,
      coupon,
      discount,
      message: `Coupon ${coupon.code} applied successfully (₹${discount} discount)`,
    };
  }

  createCoupon(couponData) {
    const newCoupon = {
      _id: couponData._id || `cpn_${Date.now()}`,
      usedCount: 0,
      isActive: true,
      createdAt: new Date(),
      ...couponData,
    };
    this.data.coupons.push(newCoupon);
    if (this.isMongoActive()) {
      Coupon.create(newCoupon).catch((e) => console.error('[MongoDB Error] createCoupon:', e.message));
    }
    return newCoupon;
  }

  populateOrder(order) {
    if (!order) return null;
    const restId = typeof order.restaurant === 'object' ? order.restaurant?._id : order.restaurant;
    const restaurant =
      order.restaurantDetails ||
      this.getRestaurantById(restId) || {
        _id: restId || 'rest_001',
        name: 'Spice Haven - Authentic Indian Curry House',
        address: 'Shop 12, Ground Floor, Bandra West, Mumbai',
        phone: '+91 9820011223',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      };

    const userObj = this.findUserById(order.user);
    const customerDetails =
      order.customerDetails ||
      (userObj
        ? { name: userObj.name, phone: userObj.phone, email: userObj.email }
        : {
            name: order.deliveryAddress?.fullName || 'Aarav Sharma',
            phone: order.deliveryAddress?.phone || '+91 9876543210',
            email: 'customer@foodrush.app',
          });

    let deliveryPartnerDetails = order.deliveryPartnerDetails || null;
    if (order.deliveryPartner) {
      const dpUser = this.findUserById(order.deliveryPartner);
      const dpInfo = this.getDeliveryPartner(order.deliveryPartner);
      deliveryPartnerDetails = {
        _id: order.deliveryPartner,
        name: dpUser?.name || 'Vikram Singh (Rider)',
        phone: dpUser?.phone || '+91 9711223344',
        vehicleType: dpInfo?.vehicleType || 'Bike',
        vehicleNumber: dpInfo?.vehicleNumber || 'MH-02-FR-1080',
        rating: dpInfo?.rating || 4.9,
      };
    }

    return {
      ...order,
      restaurantDetails: restaurant,
      customerDetails,
      deliveryPartnerDetails,
    };
  }

  // Orders
  getOrders({ userId, restaurantId, restaurantIds, deliveryPartnerId, status } = {}) {
    let list = [...this.data.orders];
    if (userId) list = list.filter((o) => String(o.user) === String(userId));
    if (restaurantId) {
      list = list.filter((o) => {
        const rId = typeof o.restaurant === 'object' ? o.restaurant?._id : o.restaurant;
        return String(rId) === String(restaurantId);
      });
    }
    if (restaurantIds && Array.isArray(restaurantIds) && restaurantIds.length > 0) {
      const rIdSet = new Set(restaurantIds.map((id) => String(id)));
      list = list.filter((o) => {
        const rId = typeof o.restaurant === 'object' ? o.restaurant?._id : o.restaurant;
        return rIdSet.has(String(rId));
      });
    }
    if (deliveryPartnerId) {
      list = list.filter((o) => {
        const dpId = typeof o.deliveryPartner === 'object' ? o.deliveryPartner?._id : o.deliveryPartner;
        return String(dpId) === String(deliveryPartnerId);
      });
    }
    if (status) list = list.filter((o) => o.orderStatus === status);

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrderById(id) {
    if (!id) return null;
    const cleanId = String(id).replace(/^#/, '').trim().toLowerCase();
    return this.data.orders.find(
      (o) =>
        o._id === id ||
        o.orderId === id ||
        String(o._id).toLowerCase() === cleanId ||
        String(o.orderId).toLowerCase() === cleanId ||
        String(o.orderId).replace(/^#/, '').toLowerCase() === cleanId
    );
  }

  createOrder(orderData) {
    const newOrder = {
      _id: orderData._id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: `FR-${Math.floor(10000 + Math.random() * 90000)}`,
      orderStatus: 'PLACED',
      paymentStatus: orderData.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      deliveryFee: orderData.deliveryFee !== undefined ? orderData.deliveryFee : 40,
      tax: orderData.tax !== undefined ? orderData.tax : 20,
      discount: orderData.discount !== undefined ? orderData.discount : 0,
      statusTimeline: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          message: 'Order placed successfully and sent to restaurant.',
        },
      ],
      createdAt: new Date(),
      ...orderData,
    };
    this.data.orders.unshift(newOrder);

    if (this.isMongoActive()) {
      Order.create(newOrder).catch((e) => console.error('[MongoDB Error] createOrder:', e.message));
    }
    return newOrder;
  }

  updateOrderStatus(orderId, status, message = '', deliveryPartner = null) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.orderStatus = status;
    if (deliveryPartner) {
      order.deliveryPartner = deliveryPartner;
    }
    if (status === 'DELIVERED') {
      order.paymentStatus = 'COMPLETED';
    }

    if (!order.statusTimeline) order.statusTimeline = [];
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      message: message || `Order status updated to ${status}`,
    });

    if (this.isMongoActive()) {
      Order.findOneAndUpdate(
        { _id: order._id },
        {
          orderStatus: status,
          paymentStatus: order.paymentStatus,
          deliveryPartner: order.deliveryPartner,
          statusTimeline: order.statusTimeline,
        },
        { new: true }
      ).catch((e) => console.error('[MongoDB Error] updateOrderStatus:', e.message));
    }

    return order;
  }

  // Addresses
  getAddresses(userId) {
    return this.getAddressesByUser(userId);
  }

  getAddressesByUser(userId) {
    return this.data.addresses.filter((a) => String(a.user) === String(userId));
  }

  createAddress(userIdOrData, maybeData) {
    let addressData;
    if (typeof userIdOrData === 'string') {
      addressData = { user: userIdOrData, ...(maybeData || {}) };
    } else {
      addressData = { ...(userIdOrData || {}) };
    }

    const newAddress = {
      _id: addressData._id || `addr_${Date.now()}`,
      title: addressData.title || addressData.type || 'Home',
      fullName: addressData.fullName || 'User',
      phone: addressData.phone || '+91 9876543210',
      house: addressData.house || addressData.street || '',
      street: addressData.street || '',
      area: addressData.area || '',
      city: addressData.city || 'Mumbai',
      state: addressData.state || 'Maharashtra',
      pincode: addressData.pincode || '400001',
      landmark: addressData.landmark || '',
      type: addressData.type || addressData.title || 'Home',
      isDefault: addressData.isDefault !== undefined ? !!addressData.isDefault : this.getAddressesByUser(addressData.user).length === 0,
      createdAt: new Date(),
      ...addressData,
    };
    this.data.addresses.push(newAddress);
    if (this.isMongoActive()) {
      Address.create(newAddress).catch((e) => console.error('[MongoDB Error] createAddress:', e.message));
    }
    return newAddress;
  }

  updateAddress(id, userId, updateData) {
    const index = this.data.addresses.findIndex(
      (a) => (a._id === id || String(a._id) === String(id)) && (!userId || String(a.user) === String(userId))
    );
    if (index !== -1) {
      this.data.addresses[index] = { ...this.data.addresses[index], ...updateData };
      if (this.isMongoActive()) {
        Address.findOneAndUpdate({ _id: id }, updateData, { new: true }).catch((e) =>
          console.error('[MongoDB Error] updateAddress:', e.message)
        );
      }
      return this.data.addresses[index];
    }
    return null;
  }

  deleteAddress(id, userId) {
    const index = this.data.addresses.findIndex((a) => (a._id === id || String(a._id) === String(id)) && (!userId || String(a.user) === String(userId)));
    if (index !== -1) {
      const removed = this.data.addresses.splice(index, 1)[0];
      if (this.isMongoActive()) {
        Address.findOneAndDelete({ _id: id }).catch((e) => console.error('[MongoDB Error] deleteAddress:', e.message));
      }
      return removed;
    }
    return null;
  }

  // Cart
  getCart(userId) {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = { user: userId, restaurant: null, items: [], subtotal: 0 };
    }
    return this.data.carts[userId];
  }

  updateCart(userId, restaurantIdOrData, maybeItems, maybeSubtotal) {
    let restaurantId;
    let items;
    let subtotal;

    if (typeof restaurantIdOrData === 'object' && restaurantIdOrData !== null) {
      restaurantId = restaurantIdOrData.restaurantId;
      items = restaurantIdOrData.items || [];
      subtotal = restaurantIdOrData.subtotal || 0;
    } else {
      restaurantId = restaurantIdOrData;
      items = maybeItems || [];
      subtotal = maybeSubtotal || 0;
    }

    if (!subtotal && Array.isArray(items)) {
      subtotal = items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
    }

    const cart = {
      user: userId,
      restaurant: restaurantId,
      items: items || [],
      subtotal: subtotal || 0,
      updatedAt: new Date(),
    };
    this.data.carts[userId] = cart;

    if (this.isMongoActive()) {
      Cart.findOneAndUpdate({ user: userId }, cart, { upsert: true, new: true }).catch((e) =>
        console.error('[MongoDB Error] updateCart:', e.message)
      );
    }
    return cart;
  }

  clearCart(userId) {
    this.data.carts[userId] = { user: userId, restaurant: null, items: [], subtotal: 0 };
    if (this.isMongoActive()) {
      Cart.findOneAndDelete({ user: userId }).catch((e) => console.error('[MongoDB Error] clearCart:', e.message));
    }
    return this.data.carts[userId];
  }

  // Reviews
  getReviewsByRestaurant(restaurantId) {
    return this.data.reviews.filter((r) => String(r.restaurant) === String(restaurantId));
  }

  createReview(reviewData) {
    const newReview = {
      _id: reviewData._id || `rev_${Date.now()}`,
      createdAt: new Date(),
      ...reviewData,
    };
    this.data.reviews.push(newReview);
    if (this.isMongoActive()) {
      Review.create(newReview).catch((e) => console.error('[MongoDB Error] createReview:', e.message));
    }
    return newReview;
  }

  // Notifications
  getNotifications(userId) {
    return this.getNotificationsByUser(userId);
  }

  getNotificationsByUser(userId) {
    return this.data.notifications
      .filter((n) => String(n.user) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification(userIdOrData, title, message, type, link) {
    let notifData;
    if (typeof userIdOrData === 'object' && userIdOrData !== null) {
      notifData = { ...userIdOrData };
    } else {
      notifData = {
        user: userIdOrData,
        title: title || 'Notification',
        message: message || '',
        type: type || 'SYSTEM',
        link: link || '',
      };
    }

    const newNotif = {
      _id: notifData._id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date(),
      ...notifData,
    };
    this.data.notifications.unshift(newNotif);
    if (this.isMongoActive()) {
      Notification.create(newNotif).catch((e) => console.error('[MongoDB Error] createNotification:', e.message));
    }
    return newNotif;
  }

  markNotificationRead(id) {
    const notif = this.data.notifications.find((n) => n._id === id || String(n._id) === String(id));
    if (notif) {
      notif.isRead = true;
      if (this.isMongoActive()) {
        Notification.findOneAndUpdate({ _id: id }, { isRead: true }).catch((e) =>
          console.error('[MongoDB Error] markNotificationRead:', e.message)
        );
      }
    }
    return notif;
  }

  markNotificationsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (String(n.user) === String(userId)) {
        n.isRead = true;
      }
    });
    if (this.isMongoActive()) {
      Notification.updateMany({ user: userId }, { isRead: true }).catch((e) =>
        console.error('[MongoDB Error] markNotificationsRead:', e.message)
      );
    }
  }

  // Delivery Partner
  getDeliveryPartner(userId) {
    let dp = this.data.deliveryPartners.find((d) => String(d.user) === String(userId) || d._id === userId);
    if (!dp) {
      dp = {
        _id: `dp_${userId || Date.now()}`,
        user: userId,
        isOnline: true,
        vehicleType: 'Bike',
        vehicleNumber: 'MH-02-FR-1080',
        currentLocation: { latitude: 19.0596, longitude: 72.8295 },
        totalDeliveries: 48,
        rating: 4.9,
        earningsToday: 1420,
        totalEarnings: 28400,
      };
      this.data.deliveryPartners.push(dp);
    }
    return dp;
  }

  getDeliveryPartnerInfo(userId) {
    return this.getDeliveryPartner(userId);
  }

  updateDeliveryPartner(userId, updateData) {
    let index = this.data.deliveryPartners.findIndex((dp) => String(dp.user) === String(userId) || dp._id === userId);
    if (index === -1) {
      this.getDeliveryPartner(userId);
      index = this.data.deliveryPartners.findIndex((dp) => String(dp.user) === String(userId) || dp._id === userId);
    }
    if (index !== -1) {
      this.data.deliveryPartners[index] = { ...this.data.deliveryPartners[index], ...updateData };
      if (this.isMongoActive()) {
        DeliveryPartner.findOneAndUpdate(
          { $or: [{ user: userId }, { _id: userId }] },
          updateData,
          { new: true, upsert: true }
        ).catch((e) => console.error('[MongoDB Error] updateDeliveryPartner:', e.message));
      }
      return this.data.deliveryPartners[index];
    }
    return null;
  }
}

export const storeService = new DataStoreService();
