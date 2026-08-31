# 🍕 FoodRush - Food Delivery Web Application

A full-stack Food Delivery and Multi-Role Platform (Customer, Restaurant Owner, Delivery Partner, Admin) with real-time order tracking using React, Vite, Redux Toolkit, Tailwind CSS, Express, and Socket.IO.

---

## 📁 Project Architecture & File Structure

```text
FoodRush/
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── SearchBar.jsx
│   │   │   │
│   │   │   ├── navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── MobileMenu.jsx
│   │   │   │
│   │   │   ├── restaurant/
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   ├── RestaurantList.jsx
│   │   │   │   └── RestaurantDetails.jsx
│   │   │   │
│   │   │   ├── food/
│   │   │   │   ├── FoodCard.jsx
│   │   │   │   ├── FoodList.jsx
│   │   │   │   └── FoodDetails.jsx
│   │   │   │
│   │   │   └── cart/
│   │   │       ├── CartItem.jsx
│   │   │       └── CartSummary.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Restaurants.jsx
│   │   │   ├── RestaurantDetails.jsx
│   │   │   ├── FoodDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── VerifyOTP.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Users.jsx
│   │   │       ├── Restaurants.jsx
│   │   │       ├── Foods.jsx
│   │   │       └── Orders.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── foodService.js
│   │   │   ├── restaurantService.js
│   │   │   ├── orderService.js
│   │   │   └── paymentService.js
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── foodController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── paymentController.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Food.js
│   │   │   ├── Category.js
│   │   │   ├── Cart.js
│   │   │   ├── Order.js
│   │   │   └── Review.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── restaurantRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── paymentRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── otpService.js
│   │   │   └── paymentService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── generateOTP.js
│   │   │   └── validators.js
│   │   │
│   │   └── app.js
│   │
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### Option 1: Root Project (Concurrently - Recommended)
Run both backend and frontend together with a single command from the root directory:
```bash
# Starts Express (Port 5000) & Vite React (Port 5173) simultaneously
npm run dev
```

Or run individually:
* **Backend:** `npm run backend` (Port 5000)
* **Frontend:** `npm run frontend` (Port 5173)

---

### Option 2: Standalone Folders

#### Backend:
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:5000`.

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.
