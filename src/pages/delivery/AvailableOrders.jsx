import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  ShoppingBag,
  AlertTriangle,
  Store,
  CheckCircle2,
  Filter,
  ArrowRight,
  Bike,
  Sparkles,
  Eye,
  X,
  Compass,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { useSocket } from '../../hooks/useSocket';
import IncomingRequestModal from '../../components/delivery/IncomingRequestModal';

export default function AvailableOrders() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedPreviewOrder, setSelectedPreviewOrder] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'HIGH_PAYOUT' | 'NEARBY'
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);

  const profileRef = React.useRef(profile);
  profileRef.current = profile;

  const fetchOrders = React.useCallback(() => {
    Promise.all([
      deliveryService.getAvailableOrders().catch(() => ({ data: [] })),
      deliveryService.getProfile().catch(() => null),
    ]).then(([ordersRes, profileRes]) => {
      setOrders(ordersRes.data || []);
      if (profileRes?.data) {
        setProfile(profileRes.data);
      }
    });
  }, []);

  useEffect(() => {
    fetchOrders();

    if (socket) {
      const handleNewDelivery = (newOrder) => {
        fetchOrders();
        if (newOrder && profileRef.current?.isOnline && !profileRef.current?.activeOrder) {
          setIncomingOrderAlert(newOrder);
        }
      };

      socket.on('newDeliveryAvailable', handleNewDelivery);
      socket.on('orderPlaced', fetchOrders);
      socket.on('orderStatusChanged', fetchOrders);

      const interval = setInterval(fetchOrders, 8000);

      return () => {
        clearInterval(interval);
        socket.off('newDeliveryAvailable', handleNewDelivery);
        socket.off('orderPlaced', fetchOrders);
        socket.off('orderStatusChanged', fetchOrders);
      };
    } else {
      const interval = setInterval(fetchOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [socket, fetchOrders]);

  const handleAccept = async (id) => {
    try {
      await deliveryService.acceptDelivery(id);
      setSelectedPreviewOrder(null);
      setIncomingOrderAlert(null);
      alert('Delivery accepted! Assigned route created.');
      navigate('/delivery/route');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const isOnline = profile?.isOnline ?? true;
  const hasActiveOrder = !!profile?.activeOrder;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterType === 'HIGH_PAYOUT') return (o.deliveryFee || 60) >= 70;
    if (filterType === 'NEARBY') return true;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Real-time Incoming Alert Modal */}
      {incomingOrderAlert && isOnline && !hasActiveOrder && (
        <IncomingRequestModal
          order={incomingOrderAlert}
          onAccept={handleAccept}
          onDecline={() => setIncomingOrderAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Available Delivery Requests</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Incoming orders ready for immediate kitchen pickup and doorstep delivery
          </p>
        </div>

        {hasActiveOrder && (
          <Link
            to="/delivery/route"
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Go to Active Assigned Route</span>
          </Link>
        )}
      </div>

      {/* Status Warning Banners */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">You are currently OFFLINE</p>
            <p className="mt-0.5 font-medium text-amber-700">
              Please switch to "ONLINE" on your Dashboard to accept new delivery requests.
            </p>
          </div>
          <Link
            to="/delivery/dashboard"
            className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 shrink-0"
          >
            Go Online
          </Link>
        </div>
      )}

      {hasActiveOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold">Active Delivery Trip in Progress</p>
              <p className="mt-0.5 font-medium text-blue-700">
                You have an active assigned route. Complete your current delivery before accepting new orders.
              </p>
            </div>
          </div>
          <Link
            to="/delivery/route"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-center self-start sm:self-center shrink-0 transition-colors flex items-center space-x-1"
          >
            <span>View Active Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: `All Requests (${orders.length})` },
          { id: 'HIGH_PAYOUT', label: 'High Payout (₹70+)' },
          { id: 'NEARBY', label: 'Nearby (< 3 km)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">No Incoming Delivery Requests Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {!isOnline
              ? 'Switch to ONLINE status on your dashboard to receive incoming delivery broadcasts.'
              : hasActiveOrder
              ? 'Complete your current active delivery trip to unlock more orders.'
              : 'New customer orders placed in your delivery zone will ping automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((o) => (
            <div
              key={o._id}
              className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-orange-200 flex flex-col justify-between shadow-xs hover:shadow-md transition-all gap-4"
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-sm">Order #{o.orderId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(o.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                    Payout: ₹{o.deliveryFee || 60}
                  </span>
                </div>

                {/* Pickup & Drop Points */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800">
                        {o.restaurantDetails?.name || 'Restaurant Kitchen'}
                      </span>
                      <p className="text-slate-500 line-clamp-1">{o.restaurantDetails?.address || 'Pickup address'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800">
                        {o.deliveryAddress?.house ? `${o.deliveryAddress.house}, ` : ''}
                        {o.deliveryAddress?.area || 'Delivery Destination'}
                      </span>
                      <p className="text-slate-500 line-clamp-1">
                        {o.customerDetails?.name ? `Customer: ${o.customerDetails.name}` : 'Customer Doorstep'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Package: </span>
                  <span className="line-clamp-1">
                    {(o.items || []).map((i) => `${i.quantity}x ${i.name || i.food?.name || 'Dish'}`).join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPreviewOrder(o)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Route</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccept(o._id)}
                  disabled={!isOnline || hasActiveOrder}
                  className={`flex-2 font-black py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 ${
                    !isOnline || hasActiveOrder
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 hover:scale-[1.02]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Assign Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Route Preview before accepting */}
      {selectedPreviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-900 text-base">Route Map Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick mini-route preview graphic */}
            <div className="h-44 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 40,80 C 140,20 220,140 380,60"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute left-8 top-16 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                Pickup
              </div>
              <div className="absolute right-8 top-10 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                Drop
              </div>
              <div className="text-white text-xs font-bold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700 z-10">
                Est. Trip: 3.6 km • 15 mins
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                <span className="font-bold text-amber-900 block">Restaurant Pickup:</span>
                <p className="text-amber-800 font-medium">{selectedPreviewOrder.restaurantDetails?.name}</p>
                <p className="text-slate-500">{selectedPreviewOrder.restaurantDetails?.address}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <span className="font-bold text-emerald-900 block">Customer Destination:</span>
                <p className="text-emerald-800 font-medium">
                  {selectedPreviewOrder.deliveryAddress?.house ? `${selectedPreviewOrder.deliveryAddress.house}, ` : ''}
                  {selectedPreviewOrder.deliveryAddress?.area}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Guaranteed Fee</p>
                <p className="text-lg font-black text-emerald-600">₹{selectedPreviewOrder.deliveryFee || 60}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPreviewOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!isOnline || hasActiveOrder}
                  onClick={() => handleAccept(selectedPreviewOrder._id)}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept This Route</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
