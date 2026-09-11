import React, { useEffect, useState, useCallback } from 'react';
import { ChefHat, Bike, Clock, CheckCircle2, AlertCircle, RefreshCw, Phone, User, MapPin } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const socket = useSocket();

  const loadOrders = useCallback(async () => {
    try {
      const res = await orderService.getOrders();
      const list = res.data?.data || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch restaurant orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    if (socket) {
      const handleOrderUpdate = (updatedOrder) => {
        if (!updatedOrder) return;
        setOrders((prev) => {
          const exists = prev.some((o) => o._id === updatedOrder._id || o.orderId === updatedOrder.orderId);
          if (exists) {
            return prev.map((o) =>
              o._id === updatedOrder._id || o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o
            );
          }
          return [updatedOrder, ...prev];
        });
      };

      socket.on('orderPlaced', handleOrderUpdate);
      socket.on('newOrder', handleOrderUpdate);
      socket.on('orderStatusChanged', handleOrderUpdate);

      return () => {
        socket.off('orderPlaced', handleOrderUpdate);
        socket.off('newOrder', handleOrderUpdate);
        socket.off('orderStatusChanged', handleOrderUpdate);
      };
    }

    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [socket, loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      loadOrders();
    } catch (err) {
      console.error('Status update failed:', err);
      loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.orderStatus);
    if (statusFilter === 'DELIVERING') return ['OUT_FOR_DELIVERY', 'PICKED_UP'].includes(o.orderStatus);
    if (statusFilter === 'COMPLETED') return o.orderStatus === 'DELIVERED';
    return o.orderStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <span>Kitchen & Order Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time synchronization with Customer App and Delivery Rider Network
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadOrders();
          }}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ALL', label: 'All Orders', count: orders.length },
          {
            key: 'ACTIVE',
            label: 'Kitchen Active',
            count: orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.orderStatus)).length,
          },
          {
            key: 'DELIVERING',
            label: 'On Route / Out',
            count: orders.filter((o) => ['OUT_FOR_DELIVERY', 'PICKED_UP'].includes(o.orderStatus)).length,
          },
          {
            key: 'COMPLETED',
            label: 'Delivered',
            count: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              statusFilter === tab.key
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                statusFilter === tab.key ? 'bg-orange-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No orders found in this status</h3>
          <p className="text-xs text-slate-400">Incoming kitchen orders will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((o) => {
            const rider = o.deliveryPartnerDetails;
            const customer = o.customerDetails;
            return (
              <div
                key={o._id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-slate-200 transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-slate-900">Order #{o.orderId || o._id}</span>
                    <span className="text-xs text-slate-400">
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : o.orderStatus === 'READY_FOR_PICKUP'
                          ? 'bg-purple-100 text-purple-800'
                          : o.orderStatus === 'PREPARING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-600">Update Status:</label>
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      disabled={updatingId === o._id || o.orderStatus === 'DELIVERED' || o.orderStatus === 'CANCELLED'}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING (In Kitchen)</option>
                      <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED / REJECTED</option>
                    </select>
                  </div>
                </div>

                {/* Items & Customer & Rider Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items */}
                  <div className="space-y-1.5 md:col-span-1">
                    <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Ordered Items</p>
                    <div className="space-y-1 text-slate-600">
                      {(o.items || []).map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-semibold">
                            {i.quantity}x {i.name}
                          </span>
                          <span className="font-bold text-slate-800">₹{(i.price || 0) * (i.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900">
                      <span>Total:</span>
                      <span className="text-orange-600">₹{o.totalAmount}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Customer Details</p>
                    <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{customer?.name || o.deliveryAddress?.fullName || 'Customer'}</span>
                      </p>
                      <p className="flex items-center space-x-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer?.phone || o.deliveryAddress?.phone || '+91 9876543210'}</span>
                      </p>
                      <p className="flex items-start space-x-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {o.deliveryAddress?.house ? `${o.deliveryAddress.house}, ` : ''}
                          {o.deliveryAddress?.street || ''}, {o.deliveryAddress?.city || 'Mumbai'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery Partner Info */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Delivery Fleet Status</p>
                    {rider ? (
                      <div className="bg-orange-50/70 border border-orange-100 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center space-x-2">
                          <Bike className="w-4 h-4 text-orange-600" />
                          <span className="font-bold text-orange-950">{rider.name || 'Assigned Rider'}</span>
                        </div>
                        <p className="text-orange-700 flex items-center space-x-1 text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{rider.phone || '+91 9711223344'}</span>
                        </p>
                        <p className="text-[10px] text-orange-600 font-medium">
                          Vehicle: {rider.vehicleType || 'Bike'} ({rider.vehicleNumber || 'MH-02-FR-1080'})
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700 flex items-center space-x-1.5">
                          <Bike className="w-3.5 h-3.5 text-slate-400" />
                          <span>Waiting for Rider Acceptance</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Broadcasted to online delivery partners in this area.
                        </p>
                      </div>
                    )}
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
