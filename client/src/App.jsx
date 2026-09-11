import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { fetchMe } from './redux/slices/authSlice';
import CartDrawer from './components/cart/CartDrawer';
import CartToast from './components/common/CartToast';
import ScrollToTop from './components/common/ScrollToTop';
import { ProtectedRoute, RoleRoute } from './components/ui/ProtectedRoute';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import Home from './pages/customer/Home';
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetails from './pages/customer/RestaurantDetails';
import FoodDetails from './pages/customer/FoodDetails';
import Search from './pages/customer/Search';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';
import Favorites from './pages/customer/Favorites';
import Addresses from './pages/customer/Addresses';
import Profile from './pages/customer/Profile';
import Notifications from './pages/customer/Notifications';
import LiveTracking from './pages/customer/LiveTracking';

// Restaurant Pages
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantOrders from './pages/restaurant/Orders';
import RestaurantMenu from './pages/restaurant/Menu';
import RestaurantCategories from './pages/restaurant/Categories';
import RestaurantReviews from './pages/restaurant/Reviews';
import RestaurantRevenue from './pages/restaurant/Revenue';
import RestaurantAnalytics from './pages/restaurant/Analytics';
import RestaurantSettings from './pages/restaurant/Settings';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import ActiveRoute from './pages/delivery/ActiveRoute';
import AvailableOrders from './pages/delivery/AvailableOrders';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import DeliveryEarnings from './pages/delivery/Earnings';
import DeliveryProfile from './pages/delivery/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminFoods from './pages/admin/Foods';
import AdminUsers from './pages/admin/Users';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminDeliveryPartners from './pages/admin/DeliveryPartners';
import AdminOrders from './pages/admin/Orders';
import AdminCoupons from './pages/admin/Coupons';
import AdminPayments from './pages/admin/Payments';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('foodrush_token')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
      <ScrollToTop />
      <Routes>
        {/* Auth Routes (Standalone without main navbar/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public & Customer Layout Route with Persistent Navigation Bar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/live-tracking" element={<LiveTracking />} />

          {/* Customer Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Restaurant Owner Portal with Persistent Dashboard Layout */}
        <Route element={<RoleRoute allowedRoles={['restaurant_owner', 'admin']} />}>
          <Route element={<DashboardLayout role="restaurant_owner" />}>
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurant/orders" element={<RestaurantOrders />} />
            <Route path="/restaurant/menu" element={<RestaurantMenu />} />
            <Route path="/restaurant/categories" element={<RestaurantCategories />} />
            <Route path="/restaurant/reviews" element={<RestaurantReviews />} />
            <Route path="/restaurant/revenue" element={<RestaurantRevenue />} />
            <Route path="/restaurant/analytics" element={<RestaurantAnalytics />} />
            <Route path="/restaurant/settings" element={<RestaurantSettings />} />
          </Route>
        </Route>

        {/* Delivery Partner Portal with Persistent Dashboard Layout */}
        <Route element={<RoleRoute allowedRoles={['delivery_partner', 'admin']} />}>
          <Route element={<DashboardLayout role="delivery_partner" />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/route" element={<ActiveRoute />} />
            <Route path="/delivery/available-orders" element={<AvailableOrders />} />
            <Route path="/delivery/history" element={<DeliveryHistory />} />
            <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
            <Route path="/delivery/profile" element={<DeliveryProfile />} />
          </Route>
        </Route>

        {/* Admin Portal with Persistent Dashboard Layout */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/foods" element={<AdminFoods />} />
            <Route path="/admin/catalog" element={<AdminFoods />} />
            <Route path="/admin/food-items" element={<AdminFoods />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />
            <Route path="/admin/delivery-partners" element={<AdminDeliveryPartners />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* 404 Fallback Route wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Global Slide-Over Cart Drawer & Toast Notifications */}
      <CartDrawer />
      <CartToast />
    </div>
  );
}
