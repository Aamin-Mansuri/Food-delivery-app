# 🍕 FoodRush – Multi-Vendor Food Delivery Platform

A full-stack MERN (MongoDB, Express, React, Node.js) food delivery application featuring four distinct user roles: **Customer**, **Restaurant Owner**, **Delivery Partner**, and **Admin**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev        # Runs on http://localhost:5000
```

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev        # Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Demo Login Accounts

Use these on the **Login page** (1-click demo buttons available):

| Role               | Email                     | Password     |
|--------------------|---------------------------|--------------|
| Customer           | customer@foodrush.com     | password123  |
| Restaurant Owner   | owner@foodrush.com        | password123  |
| Delivery Partner   | delivery@foodrush.com     | password123  |
| Super Admin        | admin@foodrush.com        | password123  |

---

## 🏗️ Project Structure

```
foodrush/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Signup, OTP, Forgot Password
│   │   │   ├── customer/    # Home, Restaurants, Cart, Checkout, Orders
│   │   │   ├── restaurant/  # Dashboard, Menu, Orders, Revenue
│   │   │   ├── delivery/    # Dashboard, Available Orders, Earnings
│   │   │   └── admin/       # Dashboard, Users, Foods, Analytics
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Footer, Modal, Skeleton, Toast
│   │   │   ├── cart/        # CartDrawer, CartItem
│   │   │   ├── food/        # FoodCard, DishCustomizer
│   │   │   ├── restaurant/  # RestaurantCard
│   │   │   ├── layout/      # MainLayout, DashboardLayout
│   │   │   └── dashboard/   # Sidebar, DashboardHeader
│   │   ├── redux/
│   │   │   └── slices/      # auth, cart, order, restaurant, food...
│   │   ├── services/        # API service modules (authService, orderService...)
│   │   ├── context/         # AuthContext
│   │   └── hooks/           # useSocket
│   ├── vite.config.js       # Vite + proxy config
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                  # Express + Node.js Backend
    ├── server.js            # Entry point (HTTP + Socket.IO)
    ├── app.js               # Express app + route mounting
    ├── controllers/         # Route handlers
    ├── routes/              # Express routers
    ├── services/
    │   ├── storeService.js  # In-memory data store (+ MongoDB sync)
    │   └── backupService.js # MongoDB Atlas backup
    ├── middleware/          # auth, role, error, upload
    ├── models/              # Mongoose schemas (optional MongoDB sync)
    ├── config/              # db.js, email.js, cloudinary.js
    ├── seed/                # Seed data
    └── .env
```

---

## ✨ Features

### Customer
- Browse restaurants with search, filter by cuisine/rating
- View food menus, add to cart, customise dishes
- Checkout with address selection and coupon codes
- Real-time order tracking via Socket.IO
- Order history, favourites, profile management

### Restaurant Owner
- Dashboard with live incoming orders
- Menu management (add/edit/toggle availability)
- Revenue and analytics charts
- Customer reviews and ratings

### Delivery Partner
- See available orders to accept
- Live route display with active delivery
- Earnings tracker

### Admin
- Full platform overview: users, restaurants, orders
- Approve/reject restaurants and block users
- Coupon management (create/toggle/delete)
- MongoDB Atlas backup and restore
- Platform analytics

---

## 🔧 Environment Variables

Copy `.env.example` or edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://localhost:27017/foodrush   # Optional - uses in-memory store if unavailable
CLIENT_URL=http://localhost:5173
```

> **Note:** MongoDB is optional. The app runs fully on an in-memory data store with pre-loaded seed data. Connect MongoDB Atlas under Admin → Settings for persistence.

---

## 🛠️ Coupon Codes (Demo)

| Code         | Discount       | Min Order |
|--------------|----------------|-----------|
| FOODRUSH50   | 50% off (max ₹150) | ₹300  |
| WELCOME100   | ₹100 flat off  | ₹500      |
| SUPER20      | 20% off (max ₹100) | ₹400  |

---

## 📡 Key API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/auth/login           | Login                    |
| POST   | /api/auth/register        | Register                 |
| GET    | /api/auth/me              | Get current user         |
| GET    | /api/restaurants          | List restaurants         |
| GET    | /api/restaurants/:id      | Restaurant details       |
| GET    | /api/foods                | List foods               |
| POST   | /api/orders               | Place order              |
| GET    | /api/orders               | Get my orders            |
| PATCH  | /api/orders/:id/status    | Update order status      |
| POST   | /api/coupons/validate     | Validate coupon          |
| GET    | /api/health               | Health check             |
