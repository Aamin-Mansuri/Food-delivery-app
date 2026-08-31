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
import Payment from '../models/Payment.js';
import { storeService } from './storeService.js';

class BackupService {
  constructor() {
    this.lastBackupAt = null;
    this.lastBackupStatus = 'None';
    this.lastBackupStats = null;
    this.autoSyncEnabled = true;
    this.customAtlasUri = process.env.MONGO_URI || '';
    this.backupHistory = [];
  }

  // Check connection state & stats
  async getStatus() {
    const isConnected = mongoose.connection.readyState === 1;
    const isConnecting = mongoose.connection.readyState === 2;
    
    let host = 'Disconnected';
    let dbName = 'foodrush';
    let pingLatency = null;
    let collectionStats = {};

    if (isConnected) {
      host = mongoose.connection.host || 'MongoDB Server';
      dbName = mongoose.connection.name || 'foodrush';
      try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        pingLatency = `${Date.now() - start}ms`;

        // Gather real collection counts from MongoDB
        const [
          userCount,
          foodCount,
          restaurantCount,
          orderCount,
          categoryCount,
          couponCount,
          reviewCount,
          deliveryCount,
        ] = await Promise.all([
          User.countDocuments().catch(() => 0),
          Food.countDocuments().catch(() => 0),
          Restaurant.countDocuments().catch(() => 0),
          Order.countDocuments().catch(() => 0),
          Category.countDocuments().catch(() => 0),
          Coupon.countDocuments().catch(() => 0),
          Review.countDocuments().catch(() => 0),
          DeliveryPartner.countDocuments().catch(() => 0),
        ]);

        collectionStats = {
          users: userCount,
          foods: foodCount,
          restaurants: restaurantCount,
          orders: orderCount,
          categories: categoryCount,
          coupons: couponCount,
          reviews: reviewCount,
          deliveryPartners: deliveryCount,
        };
      } catch (err) {
        pingLatency = 'N/A';
      }
    }

    // Memory store counts
    const memoryStats = {
      users: storeService.data.users?.length || 0,
      foods: storeService.data.foods?.length || 0,
      restaurants: storeService.data.restaurants?.length || 0,
      orders: storeService.data.orders?.length || 0,
      categories: storeService.data.categories?.length || 0,
      coupons: storeService.data.coupons?.length || 0,
      reviews: storeService.data.reviews?.length || 0,
      deliveryPartners: storeService.data.deliveryPartners?.length || 0,
    };

    const isAtlas = host.includes('mongodb.net') || this.customAtlasUri.includes('mongodb.net') || this.customAtlasUri.includes('mongodb+srv');

    return {
      connected: isConnected,
      connecting: isConnecting,
      isAtlas,
      host,
      dbName,
      pingLatency,
      lastBackupAt: this.lastBackupAt,
      lastBackupStatus: this.lastBackupStatus,
      lastBackupStats: this.lastBackupStats,
      autoSyncEnabled: this.autoSyncEnabled,
      configuredUri: this.customAtlasUri ? this.maskUri(this.customAtlasUri) : 'Not configured',
      collectionStats: isConnected ? collectionStats : memoryStats,
      memoryStats,
      backupHistory: this.backupHistory.slice(0, 10),
    };
  }

  maskUri(uri) {
    if (!uri) return '';
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@');
  }

  // Test dynamic connection to MongoDB Atlas URI
  async testConnection(uri) {
    if (!uri) throw new Error('MongoDB Atlas URI is required');

    console.log(`[FoodRush Backup] Testing connection to MongoDB Atlas...`);
    const tempConn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const start = Date.now();
    await tempConn.db.admin().ping();
    const latency = `${Date.now() - start}ms`;
    const host = tempConn.host;
    const dbName = tempConn.name;
    await tempConn.close();

    return {
      success: true,
      message: `Successfully connected to MongoDB Atlas cluster: ${host}`,
      host,
      dbName,
      latency,
    };
  }

  // Connect to custom URI as the primary connection
  async connectToUri(uri) {
    if (!uri) throw new Error('MongoDB Atlas URI is required');
    this.customAtlasUri = uri;

    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`[FoodRush Backup] ✅ Connected to new MongoDB Atlas cluster: ${mongoose.connection.host}`);
      return await this.getStatus();
    } catch (error) {
      console.error(`[FoodRush Backup] Failed to connect to MongoDB Atlas URI:`, error.message);
      throw error;
    }
  }

  // Backup all data to MongoDB Atlas
  async syncAllToMongoAtlas(options = {}) {
    const targetUri = options.uri || this.customAtlasUri || process.env.MONGO_URI;
    
    // Ensure we are connected to target MongoDB instance
    if (mongoose.connection.readyState !== 1) {
      if (targetUri) {
        try {
          await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 5000 });
        } catch (err) {
          throw new Error(`Could not connect to MongoDB Atlas (${err.message}). Verify your Atlas URI credentials and Network Access (0.0.0.0/0).`);
        }
      } else {
        throw new Error('No MongoDB connection active and no Atlas URI provided.');
      }
    }

    const startTime = Date.now();
    const sourceData = storeService.data;
    const backupSummary = {
      users: 0,
      foods: 0,
      restaurants: 0,
      categories: 0,
      orders: 0,
      coupons: 0,
      addresses: 0,
      reviews: 0,
      deliveryPartners: 0,
      notifications: 0,
    };

    console.log('[FoodRush Backup] Starting full database sync to MongoDB Atlas...');

    // Helper for upsert bulk operations
    const bulkUpsert = async (Model, items, key = '_id') => {
      if (!items || !items.length) return 0;
      const operations = items.map((item) => {
        const doc = { ...item };
        const filter = { [key]: doc[key] };
        return {
          updateOne: {
            filter,
            update: { $set: doc },
            upsert: true,
          },
        };
      });
      const result = await Model.bulkWrite(operations, { ordered: false });
      return (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
    };

    // 1. Sync Users
    if (sourceData.users?.length) {
      backupSummary.users = await bulkUpsert(User, sourceData.users);
    }

    // 2. Sync Foods
    if (sourceData.foods?.length) {
      backupSummary.foods = await bulkUpsert(Food, sourceData.foods);
    }

    // 3. Sync Restaurants
    if (sourceData.restaurants?.length) {
      backupSummary.restaurants = await bulkUpsert(Restaurant, sourceData.restaurants);
    }

    // 4. Sync Categories
    if (sourceData.categories?.length) {
      backupSummary.categories = await bulkUpsert(Category, sourceData.categories);
    }

    // 5. Sync Orders
    if (sourceData.orders?.length) {
      backupSummary.orders = await bulkUpsert(Order, sourceData.orders);
    }

    // 6. Sync Coupons
    if (sourceData.coupons?.length) {
      backupSummary.coupons = await bulkUpsert(Coupon, sourceData.coupons, 'code');
    }

    // 7. Sync Addresses
    if (sourceData.addresses?.length) {
      backupSummary.addresses = await bulkUpsert(Address, sourceData.addresses);
    }

    // 8. Sync Reviews
    if (sourceData.reviews?.length) {
      backupSummary.reviews = await bulkUpsert(Review, sourceData.reviews);
    }

    // 9. Sync Delivery Partners
    if (sourceData.deliveryPartners?.length) {
      backupSummary.deliveryPartners = await bulkUpsert(DeliveryPartner, sourceData.deliveryPartners);
    }

    // 10. Sync Notifications
    if (sourceData.notifications?.length) {
      backupSummary.notifications = await bulkUpsert(Notification, sourceData.notifications);
    }

    const durationMs = Date.now() - startTime;
    const totalDocs = Object.values(backupSummary).reduce((a, b) => a + b, 0);

    this.lastBackupAt = new Date().toISOString();
    this.lastBackupStatus = 'Success';
    this.lastBackupStats = {
      totalDocuments: totalDocs,
      duration: `${durationMs}ms`,
      details: backupSummary,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };

    // Record in history log
    this.backupHistory.unshift({
      id: `bk_${Date.now()}`,
      timestamp: this.lastBackupAt,
      type: 'MongoDB Atlas Full Sync',
      totalDocuments: totalDocs,
      status: 'Success',
      duration: `${durationMs}ms`,
      host: mongoose.connection.host,
    });

    console.log(`[FoodRush Backup] ✅ MongoDB Atlas Backup completed! Backed up ${totalDocs} documents in ${durationMs}ms.`);

    return {
      success: true,
      message: `Successfully backed up ${totalDocs} documents to MongoDB Atlas!`,
      timestamp: this.lastBackupAt,
      duration: `${durationMs}ms`,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      stats: backupSummary,
      totalDocuments: totalDocs,
    };
  }

  // Single entity auto-sync hook
  async syncSingleEntity(collectionName, entity) {
    if (!this.autoSyncEnabled || mongoose.connection.readyState !== 1 || !entity) return;

    try {
      const ModelMap = {
        users: User,
        foods: Food,
        restaurants: Restaurant,
        orders: Order,
        categories: Category,
        coupons: Coupon,
        reviews: Review,
        deliveryPartners: DeliveryPartner,
        addresses: Address,
      };

      const Model = ModelMap[collectionName];
      if (!Model) return;

      const key = collectionName === 'coupons' && entity.code ? 'code' : '_id';
      await Model.findOneAndUpdate(
        { [key]: entity[key] },
        { $set: entity },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn(`[FoodRush AutoSync] Background sync to Atlas note for ${collectionName}:`, err.message);
    }
  }

  // Export full JSON dataset snapshot
  exportSnapshot() {
    const sourceData = storeService.data;
    const snapshot = {
      version: '1.0.0',
      app: 'FoodRush Multi-Vendor Food Delivery',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalUsers: sourceData.users?.length || 0,
        totalFoods: sourceData.foods?.length || 0,
        totalRestaurants: sourceData.restaurants?.length || 0,
        totalOrders: sourceData.orders?.length || 0,
        totalCategories: sourceData.categories?.length || 0,
        totalCoupons: sourceData.coupons?.length || 0,
      },
      data: {
        users: sourceData.users || [],
        foods: sourceData.foods || [],
        restaurants: sourceData.restaurants || [],
        categories: sourceData.categories || [],
        coupons: sourceData.coupons || [],
        addresses: sourceData.addresses || [],
        orders: sourceData.orders || [],
        reviews: sourceData.reviews || [],
        deliveryPartners: sourceData.deliveryPartners || [],
        notifications: sourceData.notifications || [],
      },
    };

    return snapshot;
  }

  // Restore dataset from JSON snapshot
  async restoreSnapshot(snapshotPayload, syncAtlas = true) {
    if (!snapshotPayload || !snapshotPayload.data) {
      throw new Error('Invalid backup file. Missing "data" payload structure.');
    }

    const { data } = snapshotPayload;
    
    // Update active in-memory store
    if (Array.isArray(data.users)) storeService.data.users = data.users;
    if (Array.isArray(data.foods)) storeService.data.foods = data.foods;
    if (Array.isArray(data.restaurants)) storeService.data.restaurants = data.restaurants;
    if (Array.isArray(data.categories)) storeService.data.categories = data.categories;
    if (Array.isArray(data.coupons)) storeService.data.coupons = data.coupons;
    if (Array.isArray(data.addresses)) storeService.data.addresses = data.addresses;
    if (Array.isArray(data.orders)) storeService.data.orders = data.orders;
    if (Array.isArray(data.reviews)) storeService.data.reviews = data.reviews;
    if (Array.isArray(data.deliveryPartners)) storeService.data.deliveryPartners = data.deliveryPartners;
    if (Array.isArray(data.notifications)) storeService.data.notifications = data.notifications;

    // Sync to MongoDB Atlas if connected and requested
    let atlasResult = null;
    if (syncAtlas && mongoose.connection.readyState === 1) {
      atlasResult = await this.syncAllToMongoAtlas();
    }

    return {
      success: true,
      message: 'Backup restored successfully into active database and application state.',
      restoredAt: new Date().toISOString(),
      counts: {
        users: storeService.data.users.length,
        foods: storeService.data.foods.length,
        restaurants: storeService.data.restaurants.length,
        orders: storeService.data.orders.length,
      },
      atlasSync: atlasResult,
    };
  }

  // Toggle Auto Sync
  setAutoSync(enabled) {
    this.autoSyncEnabled = Boolean(enabled);
    return {
      success: true,
      autoSyncEnabled: this.autoSyncEnabled,
      message: `Auto-sync to MongoDB Atlas is now ${this.autoSyncEnabled ? 'ENABLED' : 'DISABLED'}.`,
    };
  }
}

export const backupService = new BackupService();
