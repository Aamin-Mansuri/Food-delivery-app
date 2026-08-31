import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Store,
  ChevronRight,
  Receipt,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  FileText,
  Download,
  UtensilsCrossed,
  Tag,
  AlertTriangle,
} from 'lucide-react';

const STATUS_BADGE_STYLES = {
  DELIVERED: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    label: 'Delivered',
  },
  CANCELLED: {
    bg: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle,
    dot: 'bg-red-500',
    label: 'Cancelled',
  },
  OUT_FOR_DELIVERY: {
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: RotateCcw,
    dot: 'bg-sky-500',
    label: 'Out for Delivery',
  },
  PREPARING: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
    dot: 'bg-amber-500',
    label: 'In Kitchen',
  },
  CONFIRMED: {
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: CheckCircle2,
    dot: 'bg-indigo-500',
    label: 'Confirmed',
  },
  PLACED: {
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Clock,
    dot: 'bg-blue-500',
    label: 'Placed',
  },
};

export default function OrderHistory({
  orders = [],
  loading = false,
  onReorder,
  onCancelOrder,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, AMOUNT_DESC, AMOUNT_ASC
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter !== 'ALL' && order.orderStatus !== statusFilter) {
          return false;
        }

        // Search text: checks restaurant name, dish names, order ID, address
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const restName = (
            order.restaurantDetails?.name ||
            order.restaurant?.name ||
            ''
          ).toLowerCase();
          const orderId = (order.orderId || order._id || '').toLowerCase();
          const itemsMatch = (order.items || []).some((item) =>
            (item.name || item.food?.name || '').toLowerCase().includes(term)
          );
          const areaMatch = (order.deliveryAddress?.area || '').toLowerCase();

          return restName.includes(term) || orderId.includes(term) || itemsMatch || areaMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        const amountA = Number(a.totalAmount || 0);
        const amountB = Number(b.totalAmount || 0);

        switch (sortBy) {
          case 'DATE_ASC':
            return dateA - dateB;
          case 'AMOUNT_DESC':
            return amountB - amountA;
          case 'AMOUNT_ASC':
            return amountA - amountB;
          case 'DATE_DESC':
          default:
            return dateB - dateA;
        }
      });
  }, [orders, statusFilter, searchTerm, sortBy]);

  // Quick statistics summary
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const totalSpent = orders
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    return { totalOrders, deliveredCount, totalSpent };
  }, [orders]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-black text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Deliveries</p>
            <p className="text-xl font-black text-slate-900">{stats.deliveredCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Value Paid</p>
            <p className="text-xl font-black text-slate-900">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* 2. Search & Multi-Filter Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, item, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shrink-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'OUT_FOR_DELIVERY', label: 'Active' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-orange-600 shadow-xs border border-slate-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
            >
              <option value="DATE_DESC">Newest First</option>
              <option value="DATE_ASC">Oldest First</option>
              <option value="AMOUNT_DESC">Highest Amount</option>
              <option value="AMOUNT_ASC">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Orders List Table / Card View */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">No matching past orders</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search terms or filter criteria to see your orders.'
              : 'You haven’t placed any orders yet. Explore our top-rated restaurants to get started!'}
          </p>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="mt-2 text-xs font-bold text-orange-600 hover:underline inline-block"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig =
              STATUS_BADGE_STYLES[order.orderStatus] || STATUS_BADGE_STYLES.PLACED;
            const StatusIcon = statusConfig.icon;
            const restaurantName =
              order.restaurantDetails?.name ||
              order.restaurant?.name ||
              'Fine Dining Kitchen';
            const orderDate = new Date(order.createdAt || Date.now());
            const formattedDate = orderDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = orderDate.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING'].includes(
              order.orderStatus
            );

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all divide-y divide-slate-100 group"
              >
                {/* Upper Section: Restaurant, Timestamp, Status & Action */}
                <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                          {restaurantName}
                        </h3>
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusConfig.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1 font-medium">
                        <span className="font-bold text-slate-700">#{order.orderId || order._id}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formattedTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {canCancel && onCancelOrder && (
                      <button
                        type="button"
                        onClick={() => onCancelOrder(order)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors border border-red-200"
                      >
                        Cancel
                      </button>
                    )}

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Track & Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Middle Section: Items Summary Grid */}
                <div className="py-4 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Dishes Ordered ({(order.items || []).length} items)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate pr-2">
                          <span className="text-orange-600 font-extrabold mr-1.5">{item.quantity}x</span>
                          {item.name || item.food?.name || 'Dish Item'}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lower Section: Address & Total Paid */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="truncate max-w-xs sm:max-w-md">
                      {order.deliveryAddress?.house ? `${order.deliveryAddress.house}, ` : ''}
                      {order.deliveryAddress?.area || 'Delivery Location'}, {order.deliveryAddress?.city || 'City'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Payment: {order.paymentMethod || 'Online'}
                      </span>
                      <span className="text-base font-black text-slate-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      to={`/live-tracking`}
                      className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-colors"
                      title="Live Route Telemetry View"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
