import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import {
  Truck,
  IndianRupee,
  Clock,
  Power,
  MapPin,
  CheckCircle,
  Navigation,
  Sparkles,
  Bike,
  Store,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useSocket } from '../../hooks/useSocket';
import DriverRouteViewer from '../../components/delivery/DriverRouteViewer';
import IncomingRequestModal from '../../components/delivery/IncomingRequestModal';

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [profile, setProfile] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);
  const [dismissedOrderIds, setDismissedOrderIds] = useState(new Set());

  const stateRef = useRef({ profile: null, incomingOrderAlert: null, dismissedOrderIds: new Set() });
  stateRef.current = { profile, incomingOrderAlert, dismissedOrderIds };

  const fetchData = useCallback(async () => {
    try {
      const [profRes, availRes] = await Promise.all([
        deliveryService.getProfile().catch(() => null),
        deliveryService.getAvailableOrders().catch(() => ({ data: [] })),
      ]);

      if (profRes?.data) {
        setProfile(profRes.data?.data || profRes.data);
      }
      const orders = availRes?.data?.data || availRes?.data || [];
      setAvailableOrders(orders);

      const currentProf = profRes?.data || stateRef.current.profile;
      const currentAlert = stateRef.current.incomingOrderAlert;
      const currentDismissed = stateRef.current.dismissedOrderIds;

      // If driver is online, has no active order, and there are available orders
      // Pop up the top order as an incoming request alert
      if (currentProf?.isOnline && !currentProf?.activeOrder && orders.length > 0 && !currentAlert) {
        const topCandidate = orders.find((o) => !currentDismissed.has(o._id));
        if (topCandidate) {
          setIncomingOrderAlert(topCandidate);
        }
      }
    } catch (err) {
      console.error('Failed to load delivery data:', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (socket) {
      const onNewDelivery = (newOrder) => {
        fetchData();
        if (newOrder && stateRef.current.profile?.isOnline && !stateRef.current.profile?.activeOrder && !stateRef.current.incomingOrderAlert) {
          setIncomingOrderAlert(newOrder);
        }
      };

      socket.on('newDeliveryAvailable', onNewDelivery);
      socket.on('orderPlaced', fetchData);
      socket.on('orderStatusChanged', fetchData);

      const interval = setInterval(fetchData, 8000);

      return () => {
        clearInterval(interval);
        socket.off('newDeliveryAvailable', onNewDelivery);
        socket.off('orderPlaced', fetchData);
        socket.off('orderStatusChanged', fetchData);
      };
    } else {
      const interval = setInterval(fetchData, 8000);
      return () => clearInterval(interval);
    }
  }, [socket, fetchData]);

  const handleToggleOnline = async () => {
    const res = await deliveryService.toggleOnline();
    if (res.data?.data || res.data) {
      setProfile((prev) => ({ ...prev, isOnline: (res.data?.data || res.data)?.isOnline }));
      if (!(res.data?.data || res.data)?.isOnline) {
        setIncomingOrderAlert(null);
      }
    }
  };

  const handleAcceptIncoming = async (id) => {
    try {
      await deliveryService.acceptDelivery(id);
      setIncomingOrderAlert(null);
      fetchData();
      alert('Delivery accepted! Assigned route is now active.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleDeclineIncoming = (id) => {
    setDismissedOrderIds((prev) => new Set(prev).add(id));
    setIncomingOrderAlert(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await deliveryService.updateStatus(orderId, newStatus);
      alert(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const isOnline = profile?.isOnline ?? true;
  const activeOrder = profile?.activeOrder;

  return (
    <div className="space-y-8">
      {/* Real-time Incoming Request Modal Alert */}
      {incomingOrderAlert && isOnline && !activeOrder && (
        <IncomingRequestModal
          order={incomingOrderAlert}
          onAccept={handleAcceptIncoming}
          onDecline={handleDeclineIncoming}
        />
      )}

      {/* Header Bar with Online/Offline Switch */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Fleet Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Accept nearby delivery requests, track assigned routes, and earn daily payouts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeOrder && (
            <Link
              to="/delivery/route"
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition-all hover:scale-105"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Full Screen Route Map</span>
            </Link>
          )}

          <button
            onClick={handleToggleOnline}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-xs ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20'
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'ONLINE • ACCEPTING REQUESTS' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Today's Earnings"
          value={`₹${profile?.earningsToday || 1420}`}
          change="+18% vs yesterday"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Completed Trips"
          value={`${profile?.totalDeliveries || 48} orders`}
          icon={Truck}
          color="orange"
        />
        <StatCard
          title="Rider Rating"
          value={`${profile?.rating || 4.9} ★ (500+ Trips)`}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Active Trip Section with Embedded Interactive Route Navigator */}
      {activeOrder ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
              <h2 className="text-lg font-black text-slate-900">Current Assigned Trip</h2>
            </div>
            <Link
              to="/delivery/route"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>Expand Route Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DriverRouteViewer
            order={activeOrder}
            onUpdateStatus={handleUpdateStatus}
            onCompleteDelivery={(id) => handleUpdateStatus(id, 'DELIVERED')}
            showSimControls={true}
          />
        </div>
      ) : (
        /* No active trip promo banner */
        <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-orange-500/15">
          <div className="space-y-2 max-w-xl">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block backdrop-blur-md">
              Route Radar Ready
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              {isOnline ? 'You are Online and Ready to Receive Orders' : 'Go Online to Receive Orders'}
            </h3>
            <p className="text-xs text-orange-50 font-medium">
              Accept orders from nearby kitchens with guaranteed payouts. Once accepted, your assigned route is generated instantly.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/delivery/available-orders"
              className="px-5 py-3 bg-white hover:bg-orange-50 text-slate-950 rounded-2xl font-black text-xs shadow-md transition-all hover:scale-105"
            >
              Browse Nearby Orders ({availableOrders.length})
            </Link>
            <Link
              to="/delivery/route"
              className="px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 text-white rounded-2xl font-bold text-xs backdrop-blur-md transition-colors"
            >
              Test Route Simulator
            </Link>
          </div>
        </div>
      )}

      {/* Available Incoming Requests Pool */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg">
              Incoming Delivery Requests ({availableOrders.length})
            </h3>
            <p className="text-xs text-slate-400">
              Orders placed by customers awaiting pickup in your delivery zone
            </p>
          </div>
          <Link
            to="/delivery/available-orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            View All &rarr;
          </Link>
        </div>

        {availableOrders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bike className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No unassigned orders in your area right now.</p>
            <p className="text-[11px] text-slate-400">
              Keep your status online. New orders will ping your device automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOrders.map((o) => (
              <div
                key={o._id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-orange-300 transition-all bg-white flex flex-col justify-between space-y-4 group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Order #{o.orderId}</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ₹{o.deliveryFee || 60} Payout
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-start space-x-1.5 font-bold text-slate-800">
                      <Store className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span className="truncate">{o.restaurantDetails?.name || 'Restaurant'}</span>
                    </p>
                    <p className="flex items-start space-x-1.5 text-slate-500">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {o.deliveryAddress?.house ? `${o.deliveryAddress.house}, ` : ''}
                        {o.deliveryAddress?.area || 'Bandra West'}
                      </span>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Items: {(o.items || []).map((i) => `${i.quantity}x ${i.name || i.food?.name || 'Dish'}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIncomingOrderAlert(o)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors text-center"
                  >
                    Preview Request
                  </button>

                  <button
                    type="button"
                    disabled={!isOnline || !!activeOrder}
                    onClick={() => handleAcceptIncoming(o._id)}
                    className={`flex-2 py-2.5 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 ${
                      !isOnline || !!activeOrder
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept & Assign Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
