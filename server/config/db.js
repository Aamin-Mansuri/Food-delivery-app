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
import { initialSeedData } from '../seed/seed.js';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodrush';
    console.log(`[FoodRush] Connecting to MongoDB: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[FoodRush] ✅ MongoDB Connected successfully: ${conn.connection.host}`);

    // Seed database if collections are empty
    await seedMongoDBIfEmpty();
    return true;
  } catch (error) {
    console.warn(`[FoodRush] ⚠️ MongoDB connection note (${error.message}). Running with dynamic MongoDB schemas and reactive data layer.`);
    return false;
  }
};

export const seedMongoDBIfEmpty = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[FoodRush MongoDB] Seeding initial data into MongoDB collections...');
      const seedData = await initialSeedData();

      if (seedData.users?.length) await User.insertMany(seedData.users);
      if (seedData.restaurants?.length) await Restaurant.insertMany(seedData.restaurants);
      if (seedData.categories?.length) await Category.insertMany(seedData.categories);
      if (seedData.foods?.length) await Food.insertMany(seedData.foods);
      if (seedData.coupons?.length) await Coupon.insertMany(seedData.coupons);
      if (seedData.addresses?.length) await Address.insertMany(seedData.addresses);
      if (seedData.orders?.length) await Order.insertMany(seedData.orders);
      if (seedData.reviews?.length) await Review.insertMany(seedData.reviews);
      if (seedData.deliveryPartners?.length) await DeliveryPartner.insertMany(seedData.deliveryPartners);
      if (seedData.notifications?.length) await Notification.insertMany(seedData.notifications);

      console.log('[FoodRush MongoDB] ✅ MongoDB collections seeded successfully with rich dataset!');
    } else {
      console.log(`[FoodRush MongoDB] Existing dataset found in MongoDB (${userCount} users).`);
    }
  } catch (err) {
    console.error('[FoodRush MongoDB] Seeding error:', err.message);
  }
};
