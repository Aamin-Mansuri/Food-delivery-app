import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  IndianRupee,
  UtensilsCrossed,
  User,
  MapPin,
  ChevronDown,
  Eye,
  AlertCircle,
  RefreshCw,
  Phone,
  Calendar,
  Layers,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import Modal from '../../components/common/Modal';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load platform orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      soundFX.playPop();
      await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      soundFX.playSuccess();
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PLACED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.orderId && o.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.restaurantDetails?.name && o.restaurantDetails.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || o.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeCount = orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Platform Orders Hub
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {orders.length} Total Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Order Fulfillment & Live Feed
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time live kitchen tickets, rider dispatches, and customer delivery progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            fetchOrders();
          }}
          disabled={loading}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Orders Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total Volume</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-indigo-500">Live Active</span>
          <p className="text-xl font-black text-indigo-600 mt-1 font-mono">{activeCount} Orders</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-500">Completed</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{deliveredCount} Orders</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-rose-500">Cancelled</span>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">
            {orders.filter((o) => o.orderStatus === 'CANCELLED').length} Orders
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Diner Name, or Restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setSelectedStatus(st);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-extrabold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Restaurant</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-black text-slate-900 block">#{order.orderId || order._id?.slice(-6)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-extrabold text-slate-900 block truncate max-w-[160px]">
                      {order.restaurantDetails?.name || 'Partner Outlet'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{order.items?.length || 1} items</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">
                      {order.customerDetails?.name || order.deliveryAddress?.fullName || 'Customer'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {order.customerDetails?.phone || order.deliveryAddress?.phone || '+91 9876543210'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-black text-slate-900 font-mono">
                    ₹{order.totalAmount || 0}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] font-bold text-slate-600 block uppercase">
                      {order.paymentMethod || 'UPI'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {order.paymentStatus || 'PAID'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus ? order.orderStatus.replace('_', ' ') : 'PLACED'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="PLACED">Placed</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY_FOR_PICKUP">Ready</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Order #${selectedOrder.orderId || selectedOrder._id?.slice(-6)}`}
        >
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">STATUS</span>
                <p className="font-black text-slate-900 text-sm">{selectedOrder.orderStatus}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 font-mono">TOTAL PAID</span>
                <p className="font-black text-orange-600 text-sm font-mono">₹{selectedOrder.totalAmount}</p>
              </div>
            </div>

            {/* Restaurant & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Restaurant</span>
                <p className="font-black text-slate-900">{selectedOrder.restaurantDetails?.name || 'Partner Kitchen'}</p>
                <p className="text-[11px] text-slate-500">{selectedOrder.restaurantDetails?.address || 'Mumbai'}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Customer & Delivery</span>
                <p className="font-black text-slate-900">
                  {selectedOrder.customerDetails?.name || selectedOrder.deliveryAddress?.fullName || 'Customer'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedOrder.deliveryAddress?.house} {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}
                </p>
              </div>
            </div>

            {/* Items list */}
            <div className="border border-slate-100 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Ordered Items</span>
              <div className="divide-y divide-slate-100">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{item.name || item.food?.name || 'Dish Item'}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-black text-slate-900 font-mono">
                      ₹{(item.price || item.food?.price || 0) * (item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
