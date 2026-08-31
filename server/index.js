import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import route handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodrush';

// ==========================================
// 1. Core Middlewares
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// JSON Body Parser Middleware
app.use(express.json({ limit: '10mb' }));

// URL-encoded Body Parser Middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. MongoDB Database Connection with Mongoose
// ==========================================
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    return null;
  }
};

// Initiate connection
connectDB().catch((err) => {
  console.warn('[MongoDB] Init connection note:', err.message);
});

// ==========================================
// 3. API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Express server is active and operational',
    databaseState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/mock-ready',
    timestamp: new Date().toISOString(),
  });
});

// Root ping endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'FoodRush Express REST API',
    version: '1.0.0',
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

// ==========================================
// 4. Server Initialization (Standalone backend entry)
// ==========================================
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST && !process.env.VITE) {
  // Only start listening directly if executed as standalone entry point
  if (process.argv[1]?.endsWith('server/index.js') || process.argv[1]?.endsWith('server\\index.js')) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Express Server] Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;
