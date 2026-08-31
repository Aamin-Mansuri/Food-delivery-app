import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Store,
  Bike,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Phone,
  Power,
} from 'lucide-react';
import DriverRouteViewer from '../../components/delivery/DriverRouteViewer';
import { deliveryService } from '../../services/deliveryService';
import { useSocket } from '../../hooks/useSocket';

export default function ActiveRoute() {
  const socket = useSocket();
  const [profile, setProfile] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOrderFallback, setDemoOrderFallback] = useState(null);

  const fetchTripData = React.useCallback(async () => {
    try {
      const [profRes, availRes] = await Promise.all([
        deliveryService.getProfile().catch(() => null),
        deliveryService.getAvailableOrders().catch(() => ({ data: [] })),
      ]);

      if (profRes?.data) {
        setProfile(profRes.data);
      }
      if (availRes?.data) {
        setAvailableOrders(availRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching driver route data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTripData();

    if (socket) {
      socket.on('orderStatusChanged', fetchTripData);
      socket.on('newDeliveryAvailable', fetchTripData);

      const interval = setInterval(fetchTripData, 8000);
      return () => {
        clearInterval(interval);
        socket.off('orderStatusChanged', fetchTripData);
        socket.off('newDeliveryAvailable', fetchTripData);
      };
    } else {
      const interval = setInterval(fetchTripData, 8000);
      return () => clearInterval(interval);
    }
  }, [socket, fetchTripData]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      if (demoOrderFallback && demoOrderFallback._id === orderId) {
        setDemoOrderFallback((prev) => ({ ...prev, orderStatus: newStatus }));
        if (newStatus === 'DELIVERED') {
          alert('Demo delivery completed! ₹75 payout credited.');
        }
        return;
      }
      await deliveryService.updateStatus(orderId, newStatus);
      alert(`Trip status updated to ${newStatus.replace(/_/g, ' ')}!`);
      fetchTripData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await deliveryService.acceptDelivery(orderId);
      alert('Delivery accepted! Launching turn-by-turn route navigation.');
      setDemoOrderFallback(null);
      fetchTripData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const activeTrip = profile?.activeOrder || demoOrderFallback;

  const launchDemoTrip = () => {
    setDemoOrderFallback({
      _id: 'ord_demo_route_991',
      orderId: 'FR-88219',
      orderStatus: 'OUT_FOR_DELIVERY',
      deliveryFee: 75,
      restaurantDetails: {
        _id: 'rest_demo',
        name: 'The Mumbai Biryani Club',
        address: 'Plot 44, Hill Road, Bandra West, Mumbai',
        phone: '+91 98200 44556',
      },
      customerDetails: {
        name: 'Ananya Deshmukh',
        phone: '+91 98199 88776',
      },
      deliveryAddress: {
        house: 'Flat 602, Sea Green Heights',
        street: 'Carter Road',
        area: 'Bandra West',
        city: 'Mumbai',
      },
      items: [
        { name: 'Special Chicken Dum Biryani', quantity: 2, price: 340 },
        { name: 'Mirchi Ka Salan & Raita', quantity: 2, price: 50 },
        { name: 'Gulab Jamun (2 pcs)', quantity: 1, price: 90 },
      ],
      totalAmount: 870,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to="/delivery/dashboard"
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Assigned Route & Live Navigation
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time route guidance connecting pickup restaurant to customer doorstep
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!activeTrip && (
            <button
              type="button"
              onClick={launchDemoTrip}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Demo Route Navigation</span>
            </button>
          )}

          <Link
            to="/delivery/available-orders"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Available Orders ({availableOrders.length})
          </Link>
        </div>
      </div>

      {/* Main Route Navigator */}
      {activeTrip ? (
        <DriverRouteViewer
          order={activeTrip}
          onUpdateStatus={handleUpdateStatus}
          onCompleteDelivery={(orderId) => handleUpdateStatus(orderId, 'DELIVERED')}
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
              <Bike className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No Active Delivery Assigned</h3>
              <p className="text-xs text-slate-500">
                You do not have an active trip right now. Accept an incoming order below or start a live demo trip to test turn-by-turn navigation.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={launchDemoTrip}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 inline-flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Navigation className="w-4 h-4" />
                <span>Launch Demo Delivery Route</span>
              </button>
            </div>
          </div>

          {/* Quick List of Nearby Available Orders to Accept */}
          {availableOrders.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">
                Incoming Requests Ready for Pickup ({availableOrders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 transition-all bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Order #{ord.orderId}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Payout: ₹{ord.deliveryFee || 60}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold flex items-center space-x-1">
                        <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">{ord.restaurantDetails?.name || 'Restaurant'}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {ord.deliveryAddress?.house ? `${ord.deliveryAddress.house}, ` : ''}
                          {ord.deliveryAddress?.area || 'Delivery Destination'}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(ord._id)}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Request & View Route</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
