import http from 'http';
import path from 'path';
import express from 'express';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import app from './app.js';
import { connectDB } from './config/db.js';
import { storeService } from './services/storeService.js';

const isBackendOnly =
  process.argv.includes('--backend') ||
  process.env.npm_lifecycle_event === 'backend' ||
  process.env.npm_lifecycle_event === 'server';

const PORT = Number(process.env.PORT || (isBackendOnly ? 5000 : 3000));
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: { origin: '*' }
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinOrderRoom', (id) => socket.join(`order_${id}`));
  socket.on('joinRestaurantRoom', (id) => socket.join(`restaurant_${id}`));
  socket.on('joinDeliveryPartner', () => socket.join('delivery_partners'));
});

// Start Server
async function start() {
  await connectDB();
  await storeService.init();

  if (!isBackendOnly) {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath, { maxAge: '1d', index: false }));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  const runningServer = server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  \x1b[32m\x1b[1m  🍕 FoodRush Platform [Running]\x1b[0m\n`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mLocal App:\x1b[0m   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mLocal App (IP):\x1b[0m\x1b[36mhttp://127.0.0.1:${PORT}/\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mAPI Health:\x1b[0m  \x1b[36mhttp://localhost:${PORT}/api/health\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mMode:\x1b[0m        ${process.env.NODE_ENV || 'development'}\n`);
  });

  // Graceful shutdown on SIGTERM / SIGINT for containerized deployments (Cloud Run, Docker, K8s)
  const gracefulShutdown = (signal) => {
    console.log(`\n[FoodRush] Received ${signal}. Initiating graceful shutdown...`);
    runningServer.close(() => {
      console.log('[FoodRush] HTTP server closed.');
      process.exit(0);
    });

    // Force close if it takes longer than 10 seconds
    setTimeout(() => {
      console.error('[FoodRush] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch((err) => {
  console.error('[FoodRush] Server start failed:', err);
  process.exit(1);
});
