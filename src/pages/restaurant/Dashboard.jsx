import React, { useEffect, useState } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import {
  ShoppingBag,
  IndianRupee,
  UtensilsCrossed,
  Star,
  CheckCircle2,
  Clock,
  Search,
  Power,
  ChefHat,
  PackageCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { foodService } from '../../services/foodService';
import { restaurantService } from '../../services/restaurantService';
import { useSocket } from '../../hooks/useSocket';

export default function RestaurantDashboard() {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingFoodId, setUpdatingFoodId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadDashboardData();

    if (socket) {
      socket.on('orderPlaced', () => loadDashboardData());
      socket.on('newOrder', () => loadDashboardData());
      socket.on('orderStatusChanged', () => loadDashboardData());
    }

    const interval = setInterval(() => {
      loadDashboardData();
    }, 8000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('orderPlaced');
        socket.off('newOrder');
        socket.off('orderStatusChanged');
      }
    };
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      const [ordersRes, foodsRes] = await Promise.all([
        orderService.getOrders(),
        foodService.getFoods({}),
      ]);
      const orderList = ordersRes.data?.data || ordersRes.data || [];
      const foodList = foodsRes.data?.data || foodsRes.data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
      setFoods(Array.isArray(foodList) ? foodList : []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleToggleAvailability = async (foodId, currentStatus) => {
    try {
      setUpdatingFoodId(foodId);
      const res = await foodService.toggleAvailability(foodId, !currentStatus);
      const updatedFood = res.data?.data || res.data;
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, isAvailable: !currentStatus } : f))
      );
      showToast(res.data?.message || `Menu availability updated!`);
    } catch (err) {
      alert('Failed to update dish availability');
    } finally {
      setUpdatingFoodId(null);
    }
  };

  const handleToggleStoreOpen = async () => {
    setIsStoreOpen(!isStoreOpen);
    showToast(`Kitchen status set to ${!isStoreOpen ? 'OPEN (Accepting Orders)' : 'OFFLINE'}`);
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'NEW') return o.orderStatus === 'PLACED';
    if (activeTab === 'PREPARING') return o.orderStatus === 'PREPARING' || o.orderStatus === 'CONFIRMED';
    if (activeTab === 'READY') return o.orderStatus === 'READY_FOR_PICKUP';
    return true;
  });

  // Filter menu items by search query
  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const activeFoodsCount = foods.filter((f) => f.isAvailable !== false).length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Kitchen Switch */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Spice Haven Kitchen
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isStoreOpen
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {isStoreOpen ? '● ACCEPTING ORDERS' : '○ KITCHEN OFFLINE'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Restaurant Management Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">
                Monitor incoming orders, prepare dishes, and update menu item availability in real-time.
              </p>
            </div>

            <button
              onClick={handleToggleStoreOpen}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                isStoreOpen
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isStoreOpen ? 'Kitchen Online (Click to Stop)' : 'Kitchen Offline (Click to Open)'}</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`₹${totalRevenue || 48500}`}
              change="18.5%"
              icon={IndianRupee}
              color="emerald"
            />
            <StatCard
              title="Total Kitchen Orders"
              value={orders.length || 128}
              change="12.3%"
              icon={ShoppingBag}
              color="orange"
            />
            <StatCard
              title="In-Stock Dishes"
              value={`${activeFoodsCount} / ${foods.length || 24}`}
              icon={UtensilsCrossed}
              color="blue"
            />
            <StatCard title="Customer Rating" value="4.8 ★" icon={Star} color="purple" />
          </div>

          {/* Section 1: Incoming Orders Dashboard */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                  <span>Live Incoming Orders</span>
                </h2>
                <p className="text-xs text-slate-500">Accept orders, start preparation, and notify riders</p>
              </div>

              {/* Order Status Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl space-x-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('NEW')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === 'NEW' ? 'bg-orange-600 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  New ({orders.filter((o) => o.orderStatus === 'PLACED').length})
                </button>
                <button
                  onClick={() => setActiveTab('PREPARING')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === 'PREPARING' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Preparing ({orders.filter((o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'CONFIRMED').length})
                </button>
                <button
                  onClick={() => setActiveTab('READY')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeTab === 'READY' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Ready ({orders.filter((o) => o.orderStatus === 'READY_FOR_PICKUP').length})
                </button>
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No Orders Found in this Category</p>
                <p className="text-xs text-slate-400">New customer orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((o) => (
                  <div
                    key={o._id}
                    className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm">Order #{o.orderId || o._id}</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              o.orderStatus === 'PLACED'
                                ? 'bg-orange-100 text-orange-800'
                                : o.orderStatus === 'PREPARING' || o.orderStatus === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-800'
                                : o.orderStatus === 'READY_FOR_PICKUP'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Customer: <span className="text-slate-800 font-bold">{o.deliveryAddress?.fullName || 'Customer'}</span>
                        </p>
                      </div>

                      <span className="text-base font-black text-slate-900">₹{o.totalAmount}</span>
                    </div>

                    {/* Order Items List */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400">Order Items</p>
                      {(o.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                          <span>
                            <strong className="text-slate-900">{item.quantity}x</strong> {item.name}
                          </span>
                          <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Partner Details */}
                    {o.deliveryPartner ? (
                      <div className="bg-orange-50/55 p-3 rounded-xl border border-orange-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-extrabold uppercase text-orange-800 tracking-wider">Assigned Rider</p>
                          <p className="font-bold text-slate-800">{o.deliveryPartnerDetails?.name || 'Vikram Singh (Rider)'}</p>
                          <p className="text-slate-500 font-medium">{o.deliveryPartnerDetails?.phone || '+91 9711223344'}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-900 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                          🛵 Active Rider
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/40 text-[11px] text-slate-500 font-medium text-center">
                        ⏳ Awaiting Delivery Partner assignment...
                      </div>
                    )}

                    {/* Order Action Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                      {o.orderStatus === 'PLACED' ? (
                        <button
                          onClick={() => handleStatusChange(o._id, 'PREPARING')}
                          className="w-full bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Accept & Start Preparing</span>
                        </button>
                      ) : o.orderStatus === 'PREPARING' || o.orderStatus === 'CONFIRMED' ? (
                        <button
                          onClick={() => handleStatusChange(o._id, 'READY_FOR_PICKUP')}
                          className="w-full bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready for Pickup</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Order Prepared & Ready</span>
                        </div>
                      )}

                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-300"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Menu Item Availability Status Toggle */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                  <span>Menu Availability Control</span>
                </h2>
                <p className="text-xs text-slate-500">Toggle stock status to immediately enable or disable dishes on customer app</p>
              </div>

              {/* Search Menu Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food) => {
                const isAvailable = food.isAvailable !== false;
                return (
                  <div
                    key={food._id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                      isAvailable
                        ? 'bg-white border-slate-100 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                        alt={food.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                      />

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              food.isVegetarian ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {food.isVegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{food.category || 'Main Course'}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm truncate">{food.name}</h4>
                        <p className="text-sm font-black text-slate-900">₹{food.price}</p>
                      </div>
                    </div>

                    {/* Stock Status Switch */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`text-xs font-extrabold flex items-center space-x-1 ${
                          isAvailable ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span>{isAvailable ? 'In Stock (Available)' : 'Sold Out (Disabled)'}</span>
                      </span>

                      <button
                        disabled={updatingFoodId === food._id}
                        onClick={() => handleToggleAvailability(food._id, isAvailable)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-red-500" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
    </div>
  );
}

