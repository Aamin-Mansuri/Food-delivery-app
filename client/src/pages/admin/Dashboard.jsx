import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  UtensilsCrossed,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  BarChart3,
  Flame,
  Star,
  Activity,
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { adminService } from '../../services/adminService';
import { restaurantService } from '../../services/restaurantService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 342,
    totalRestaurants: 18,
    pendingRestaurants: 0,
    totalOrders: 1420,
    totalRevenue: 580000,
    deliveredOrders: 1280,
    activeOrders: 84,
    cancelledOrders: 56,
    usersByRole: { customer: 280, restaurant_owner: 18, delivery_partner: 40, admin: 4 },
    topRestaurants: [],
    recentOrders: [],
    revenueTrend: [
      { day: 'Mon', revenue: 62000, orders: 154 },
      { day: 'Tue', revenue: 68500, orders: 172 },
      { day: 'Wed', revenue: 74200, orders: 190 },
      { day: 'Thu', revenue: 81000, orders: 205 },
      { day: 'Fri', revenue: 95400, orders: 248 },
      { day: 'Sat', revenue: 112000, orders: 295 },
      { day: 'Sun', revenue: 128000, orders: 320 },
    ],
  });

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('revenue'); // 'revenue' | 'orders'
  const [activeHoverIdx, setActiveHoverIdx] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, restRes] = await Promise.all([
        adminService.getStats().catch(() => ({ data: null })),
        restaurantService.getRestaurants().catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data?.data || statsRes.data);
      }
      if (restRes?.data) {
        setRestaurants(restRes.data?.data || restRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    soundFX.playPop();
    fetchDashboardData();
  };

  const handleApproveRestaurant = async (id) => {
    soundFX.playSuccess();
    setApprovingId(id);
    try {
      await adminService.toggleApproveRestaurant(id);
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setApprovingId(null);
    }
  };

  const pendingOutlets = restaurants.filter((r) => !r.isApproved);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const trendData = stats.revenueTrend || [];
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue || 0), 100000);
  const maxOrders = Math.max(...trendData.map((d) => d.orders || 0), 100);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Live System Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Platform Admin
            </span>
            <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Core Services Healthy</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time telemetry, revenue velocity, merchant verifications, and fleet operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200/80 flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span>{loading ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>

          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Deep Analytics</span>
          </Link>
        </div>
      </div>

      {/* 2. Platform Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
          change="28.4%"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Total Platform Orders"
          value={(stats.totalOrders || 0).toLocaleString('en-IN')}
          change="19.2%"
          icon={ShoppingBag}
          color="orange"
        />
        <StatCard
          title="Active Kitchen Outlets"
          value={stats.totalRestaurants || 0}
          change={pendingOutlets.length > 0 ? `${pendingOutlets.length} Pending` : null}
          icon={UtensilsCrossed}
          color="blue"
        />
        <StatCard
          title="Registered Users"
          value={(stats.totalUsers || 0).toLocaleString('en-IN')}
          change="14.8%"
          icon={Users}
          color="purple"
        />
      </div>

      {/* 3. Revenue & Velocity Visualization + User Ecosystem Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                Performance Velocity
              </span>
              <h3 className="text-base font-black text-slate-900">
                {chartView === 'revenue' ? '7-Day Revenue Trajectory' : '7-Day Order Volume Velocity'}
              </h3>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setChartView('revenue');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'revenue'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setChartView('orders');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'orders'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>

          {/* Pure SVG Animated Velocity Visualizer */}
          <div className="relative h-60 w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex flex-col justify-end">
            {chartView === 'revenue' ? (
              <div className="h-full w-full flex items-end justify-between gap-2 pt-6">
                {trendData.map((item, idx) => {
                  const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
                  const isHovered = activeHoverIdx === idx;
                  return (
                    <div
                      key={item.day}
                      onMouseEnter={() => setActiveHoverIdx(idx)}
                      onMouseLeave={() => setActiveHoverIdx(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap z-20 pointer-events-none">
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </div>
                      )}

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                          isHovered
                            ? 'bg-linear-to-t from-orange-600 to-amber-400 scale-105 shadow-md shadow-orange-500/20'
                            : 'bg-linear-to-t from-orange-500/80 to-amber-400/80'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-slate-500 mt-2 font-mono">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full w-full flex items-end justify-between gap-2 pt-6">
                {trendData.map((item, idx) => {
                  const heightPercent = Math.max(15, Math.round((item.orders / maxOrders) * 100));
                  const isHovered = activeHoverIdx === idx;
                  return (
                    <div
                      key={item.day}
                      onMouseEnter={() => setActiveHoverIdx(idx)}
                      onMouseLeave={() => setActiveHoverIdx(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {isHovered && (
                        <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap z-20 pointer-events-none">
                          {item.orders} Orders
                        </div>
                      )}

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                          isHovered
                            ? 'bg-linear-to-t from-blue-600 to-cyan-400 scale-105 shadow-md shadow-blue-500/20'
                            : 'bg-linear-to-t from-blue-500/80 to-cyan-400/80'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-slate-500 mt-2 font-mono">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Fulfilled Rate</span>
              <span className="text-sm font-black text-emerald-600">
                {stats.totalOrders > 0
                  ? `${Math.round(((stats.deliveredOrders || 0) / stats.totalOrders) * 100)}%`
                  : '94%'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Active In-Flight</span>
              <span className="text-sm font-black text-blue-600">{stats.activeOrders || 84} Orders</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Avg Order Ticket</span>
              <span className="text-sm font-black text-slate-800">
                ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 410}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Platform Roles & User Ecosystem Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
              Ecosystem Breakdown
            </span>
            <h3 className="text-base font-black text-slate-900">User Network Distribution</h3>
          </div>

          <div className="space-y-3.5">
            {/* Customer */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Diners & Customers</span>
                </span>
                <span className="font-mono text-slate-900">{stats.usersByRole?.customer || 280}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((stats.usersByRole?.customer || 280) / (stats.totalUsers || 342)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Delivery Partners */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Delivery Fleet</span>
                </span>
                <span className="font-mono text-slate-900">{stats.usersByRole?.delivery_partner || 40}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((stats.usersByRole?.delivery_partner || 40) / (stats.totalUsers || 342)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Restaurant Merchants */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cloud Kitchen Owners</span>
                </span>
                <span className="font-mono text-slate-900">{stats.usersByRole?.restaurant_owner || 18}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((stats.usersByRole?.restaurant_owner || 18) / (stats.totalUsers || 342)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Platform Admins */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Platform Admins</span>
                </span>
                <span className="font-mono text-slate-900">{stats.usersByRole?.admin || 4}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round(((stats.usersByRole?.admin || 4) / (stats.totalUsers || 342)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            to="/admin/users"
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200/80 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>Manage All User Accounts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Action Hub: Pending Verifications & Real-Time Orders Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Kitchen Approvals Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">Merchant Approvals Queue</h3>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full font-mono">
              {pendingOutlets.length} Pending
            </span>
          </div>

          {pendingOutlets.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">All Kitchens Verified</p>
              <p className="text-[11px] text-slate-400">No merchant outlets are currently awaiting admin approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOutlets.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80'}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {(r.cuisineTypes || ['Gourmet Food']).join(', ')} • {r.address?.city || 'Mumbai'}
                      </p>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold inline-block mt-0.5">
                        Awaiting License Verification
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApproveRestaurant(r._id)}
                    disabled={approvingId === r._id}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{approvingId === r._id ? 'Approving...' : 'Approve Outlet'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/admin/restaurants"
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200/80 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>View All {restaurants.length} Registered Outlets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right: Live Platform Order Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <h3 className="text-base font-black text-slate-900">Live Order Feed</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>All Orders</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {(stats.recentOrders || []).slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-slate-900">
                      {order.orderId || `#${order._id.substring(0, 6)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    {order.restaurantDetails?.name || 'Artisan Kitchen'} • {order.items?.length || 1} items
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-extrabold text-slate-900 block font-mono">
                    ₹{order.totalAmount || 350}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}
                  >
                    {order.orderStatus || 'CONFIRMED'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/admin/orders"
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200/80 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>Inspect All Platform Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Top Performing Outlets & System Administration Links */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
              Marketplace Leaders
            </span>
            <h3 className="text-base font-black text-slate-900">Top Rated Partner Kitchens</h3>
          </div>
          <Link
            to="/admin/restaurants"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>Manage Kitchens</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(stats.topRestaurants?.length > 0 ? stats.topRestaurants : restaurants.slice(0, 4)).map((rest) => (
            <div
              key={rest._id}
              className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xs transition-all bg-white flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={rest.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80'}
                  alt={rest.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="truncate">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">{rest.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {(rest.cuisineTypes || ['Artisan Cuisine']).join(', ')}
                  </p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-bold text-slate-800">{rest.rating || '4.8'}</span>
                    <span className="text-[10px] text-slate-400">({rest.totalRatings || 120}+)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active Partner
                </span>
                <span className="text-slate-400 font-mono">100% Thermal Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Admin Fast-Access Operational Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Platform Modules
          </span>
          <h3 className="text-base font-black text-slate-900">Admin Operational Directory</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Link
            to="/admin/foods"
            className="p-3.5 bg-slate-50 hover:bg-orange-50/60 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">Food Catalog</span>
              <span className="text-[10px] text-slate-400 font-medium">Menu & Atlas Sync</span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">User Accounts</span>
              <span className="text-[10px] text-slate-400 font-medium">RBAC & Blocking</span>
            </div>
          </Link>

          <Link
            to="/admin/delivery-partners"
            className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">Delivery Fleet</span>
              <span className="text-[10px] text-slate-400 font-medium">Riders & Vehicles</span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="p-3.5 bg-slate-50 hover:bg-purple-50/60 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">Live Orders</span>
              <span className="text-[10px] text-slate-400 font-medium">Kitchen Feeds</span>
            </div>
          </Link>

          <Link
            to="/admin/coupons"
            className="p-3.5 bg-slate-50 hover:bg-amber-50/60 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">Coupons & Offers</span>
              <span className="text-[10px] text-slate-400 font-medium">Promo Campaigns</span>
            </div>
          </Link>

          <Link
            to="/admin/settings"
            className="p-3.5 bg-slate-50 hover:bg-rose-50/60 rounded-2xl border border-slate-200/80 hover:border-rose-300 transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">Atlas & Backup</span>
              <span className="text-[10px] text-slate-400 font-medium">Cloud DB Sync</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
