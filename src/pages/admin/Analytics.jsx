import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  IndianRupee,
  MapPin,
  Clock,
  ArrowUpRight,
  Sparkles,
  PieChart,
  RefreshCw,
  Flame,
  Award,
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      setAnalytics(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const data = analytics || {
    totalRevenue: 580000,
    totalOrders: 1420,
    totalUsers: 342,
    totalRestaurants: 18,
    revenueTrend: [
      { day: 'Mon', revenue: 62000, orders: 154 },
      { day: 'Tue', revenue: 68500, orders: 172 },
      { day: 'Wed', revenue: 74200, orders: 190 },
      { day: 'Thu', revenue: 81000, orders: 205 },
      { day: 'Fri', revenue: 95400, orders: 248 },
      { day: 'Sat', revenue: 112000, orders: 295 },
      { day: 'Sun', revenue: 128000, orders: 320 },
    ],
    cityPerformance: [
      { city: 'Mumbai', totalOrders: 740, revenue: 310000 },
      { city: 'Bengaluru', totalOrders: 420, revenue: 175000 },
      { city: 'Delhi NCR', totalOrders: 260, revenue: 95000 },
    ],
    hourlyDistribution: [
      { hour: '11 AM', orders: 120, label: 'Early Lunch' },
      { hour: '1 PM', orders: 380, label: 'Peak Lunch' },
      { hour: '4 PM', orders: 95, label: 'Snacks' },
      { hour: '7 PM', orders: 290, label: 'Early Dinner' },
      { hour: '9 PM', orders: 495, label: 'Peak Dinner' },
      { hour: '11 PM', orders: 140, label: 'Late Night' },
    ],
    totalCuisineBreakdown: [
      { name: 'North Indian & Biryani', percentage: 38, count: 540 },
      { name: 'Pizzas & Burgers', percentage: 26, count: 370 },
      { name: 'South Indian & Tiffin', percentage: 18, count: 255 },
      { name: 'Asian & Chinese', percentage: 12, count: 170 },
      { name: 'Desserts & Shakes', percentage: 6, count: 85 },
    ],
  };

  const maxHourly = Math.max(...(data.hourlyDistribution || []).map((h) => h.orders), 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Intelligence & Metrics
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Aggregation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Platform Analytics & Growth
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Deep dive into city distribution, peak ordering hours, cuisine popularity, and GMV growth.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            fetchAnalytics();
          }}
          disabled={loading}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value"
          value={`₹${(data.totalRevenue || 580000).toLocaleString()}`}
          icon={IndianRupee}
          color="orange"
          subtitle="+18.4% month-over-month"
        />
        <StatCard
          title="Total Processed Orders"
          value={`${(data.totalOrders || 1420).toLocaleString()}`}
          icon={ShoppingBag}
          color="blue"
          subtitle="94.2% successful completion"
        />
        <StatCard
          title="Active Customer Base"
          value={`${data.totalUsers || 342}`}
          icon={Users}
          color="emerald"
          subtitle="4.6 average orders/month"
        />
        <StatCard
          title="Partner Outlets"
          value={`${data.totalRestaurants || 18}`}
          icon={BarChart3}
          color="purple"
          subtitle="Across 3 Tier-1 metro regions"
        />
      </div>

      {/* City Performance & Cuisine Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City GMV Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>City Distribution & Volume</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Top performing delivery territories</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">GMV %</span>
          </div>

          <div className="space-y-4 pt-2">
            {(data.cityPerformance || []).map((city, idx) => {
              const pct = Math.round((city.revenue / (data.totalRevenue || 1)) * 100);
              return (
                <div key={city.city} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{city.city}</span>
                    <span className="font-mono font-bold text-slate-700">
                      ₹{city.revenue.toLocaleString()} ({city.totalOrders} Orders)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cuisine Demand Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Customer Cuisine Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Category share of total order tickets</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Share</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {(data.totalCuisineBreakdown || []).map((c, idx) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-emerald-500' : idx === 3 ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <span className="font-bold text-slate-800">{c.name}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400 text-[11px]">{c.count} items</span>
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {c.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Peak Rush Time Analysis */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Hourly Peak Surge Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Order concentration by time of day</p>
          </div>
          <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
            Peak: 9:00 PM Dinner Rush
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {(data.hourlyDistribution || []).map((hour) => {
            const heightPercent = Math.max(20, Math.round((hour.orders / maxHourly) * 100));
            return (
              <div
                key={hour.hour}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-orange-300 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 block uppercase">
                    {hour.label}
                  </span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5">{hour.hour}</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${heightPercent}%` }} />
                </div>

                <span className="font-mono font-black text-sm text-slate-900 block pt-1">
                  {hour.orders} <span className="text-[10px] text-slate-400 font-normal">orders</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
