import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { storeService } from './services/storeService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT || 5000);

// Create HTTP server from Express app
const server = http.createServer(app);

// Setup Socket.IO for real-time features (order tracking, delivery updates)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible from any route handler via req.app.get('io')
app.set('io', io);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
<<<<<<< HEAD

  // Customer joins order tracking room
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined order room: order_${orderId}`);
  });

  // Restaurant joins their own room for incoming orders
  socket.on('joinRestaurantRoom', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
  });

  // Delivery partner joins the shared delivery pool room
  socket.on('joinDeliveryPartner', () => {
    socket.join('delivery_partners');
    console.log(`[Socket.IO] Socket ${socket.id} joined delivery_partners room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start server function
async function startServer() {
  // Connect to MongoDB (falls back to in-memory store if unavailable)
  await connectDB();

  // Initialize the in-memory data store (with seed data)
  await storeService.init();

  server.listen(PORT, '0.0.0.0', () => {
    console.log('\n  \x1b[32m\x1b[1m🍕 FoodRush Backend Server\x1b[0m\n');
    // console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAPI Server:\x1b[0m  \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    // console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mHealth Check:\x1b[0m \x1b[36mhttp://localhost:${PORT}/api/health\x1b[0m`);
    // console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mMode:\x1b[0m        ${process.env.NODE_ENV || 'development'}\n`);
  });

=======

  // Customer joins order tracking room
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined order room: order_${orderId}`);
  });

  // Restaurant joins their own room for incoming orders
  socket.on('joinRestaurantRoom', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined restaurant room: restaurant_${restaurantId}`);
  });

  // Delivery partner joins the shared delivery pool room
  socket.on('joinDeliveryPartner', () => {
    socket.join('delivery_partners');
    console.log(`[Socket.IO] Socket ${socket.id} joined delivery_partners room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start server function
async function startServer() {
  // Connect to MongoDB (falls back to in-memory store if unavailable)
  await connectDB();

  // Initialize the in-memory data store (with seed data)
  await storeService.init();

  server.listen(PORT, '0.0.0.0', () => {
    console.log('\n  \x1b[32m\x1b[1m🍕 FoodRush Backend Server\x1b[0m\n');
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAPI Server:\x1b[0m  \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mHealth Check:\x1b[0m \x1b[36mhttp://localhost:${PORT}/api/health\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mMode:\x1b[0m        ${process.env.NODE_ENV || 'development'}\n`);
  });

>>>>>>> 5efec96e6015b3a60ca7d37e1cb9ee97dacc584b
  // Graceful shutdown handlers
  const gracefulShutdown = (signal) => {
    console.log(`\n[FoodRush] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[FoodRush] HTTP server closed.');
      process.exit(0);
    });
    // Force close after 10s if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[FoodRush] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[FoodRush] Server failed to start:', err);
  process.exit(1);
});
