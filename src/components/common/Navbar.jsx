import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  MapPin,
  Search,
  User,
  Bell,
  Heart,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
  Flame,
  ShieldAlert,
  Bike,
  Sparkles,
  UtensilsCrossed,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { logout, loginUser } from '../../redux/slices/authSlice';
import { toggleCartDrawer } from '../../redux/slices/cartSlice';
import { soundFX } from '../../utils/audioFeedback';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { notifications } = useSelector((state) => state.notification);
  const { orders } = useSelector((state) => state.order);

  const [selectedLocation, setSelectedLocation] = useState('Bandra West, Mumbai');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    soundFX.muted = !soundFX.muted;
    setIsMuted(soundFX.muted);
    if (!soundFX.muted) {
      soundFX.playPop();
    }
  };

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = items.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1), 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // Check if there is an active ongoing order
  const activeOrder = Array.isArray(orders)
    ? orders.find((o) => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(o.orderStatus))
    : null;

  const locations = [
    'Bandra West, Mumbai',
    'Juhu & Vile Parle, Mumbai',
    'Powai & Hiranandani, Mumbai',
    'Indiranagar, Bengaluru',
    'Connaught Place, New Delhi',
  ];

  const handleDemoLogin = (email) => {
    dispatch(loginUser({ email, password: 'password123' })).then(() => {
      setIsProfileOpen(false);
      navigate('/');
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Location Selection */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Food<span className="text-orange-600">Rush</span>
              </span>
            </Link>

            {/* Location Selector Pill */}
            <div className="hidden md:relative md:block">
              <button
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors py-1.5 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="max-w-[150px] truncate">{selectedLocation}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLocationOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Delivery Zone
                  </div>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <Link
              to="/search"
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 hover:border-orange-300 border border-slate-200/80 text-slate-500 transition-all text-xs font-medium"
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search restaurants, dishes or cuisines...</span>
              </div>
              <span className="text-[10px] bg-white border border-slate-200 text-slate-400 font-mono px-1.5 py-0.5 rounded">⌘K</span>
            </Link>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Active Live Order Pill */}
            {activeOrder && (
              <Link
                to={`/orders/${activeOrder._id || activeOrder.orderId}`}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-all text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <Bike className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </Link>
            )}

            {/* Search Icon Mobile */}
            <Link
              to="/search"
              className="lg:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            )}

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={isMuted ? 'Sound FX Muted' : 'Sound FX Active'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                dispatch(toggleCartDrawer());
              }}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-orange-600 text-white text-[11px] font-bold rounded-full px-2 py-0.2">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-2xl border border-slate-200 hover:border-orange-300 transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')} • {user?.email}</p>
                    </div>

                    <div className="py-1">
                      {user?.role === 'customer' && (
                        <>
                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-slate-400" />
                            <span>Favorites</span>
                          </Link>
                          <Link
                            to="/addresses"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Addresses</span>
                          </Link>
                        </>
                      )}

                      {user?.role === 'restaurant_owner' && (
                        <Link
                          to="/restaurant/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-600" />
                          <span>Restaurant Portal</span>
                        </Link>
                      )}

                      {user?.role === 'delivery_partner' && (
                        <Link
                          to="/delivery/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-600" />
                          <span>Delivery Dashboard</span>
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-orange-600" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-2 px-2">
                      <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Switch Demo Role
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('customer@foodrush.com')}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                      >
                        • Customer Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('owner@foodrush.com')}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                      >
                        • Restaurant Owner Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('delivery@foodrush.com')}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                      >
                        • Delivery Partner Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('admin@foodrush.com')}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg"
                      >
                        • Admin Demo
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(logout());
                          setIsProfileOpen(false);
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center space-x-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-orange-600 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="py-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Location</p>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 bg-amber-500/5 p-3 rounded-xl border border-amber-900/10">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{selectedLocation}</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <Link
              to="/restaurants"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 text-xs font-bold text-slate-700 hover:text-orange-600"
            >
              🍽️ Explore Restaurants
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 text-xs font-bold text-slate-700 hover:text-orange-600"
            >
              📦 My Orders & Live Tracking
            </Link>
            <Link
              to="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 text-xs font-bold text-slate-700 hover:text-orange-600"
            >
              ❤️ Saved Favorites
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
