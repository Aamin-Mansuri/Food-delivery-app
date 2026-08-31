import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Navigation,
  MapPin,
  Store,
  IndianRupee,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Bike,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function IncomingRequestModal({
  order,
  onAccept,
  onDecline,
  autoCountdownSeconds = 45,
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(autoCountdownSeconds);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!order) return;
    setSecondsRemaining(autoCountdownSeconds);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline && onDecline(order._id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, autoCountdownSeconds]);

  if (!order) return null;

  const restaurantName =
    order.restaurantDetails?.name || order.restaurant?.name || 'Gourmet Kitchen';
  const restaurantAddress =
    order.restaurantDetails?.address || 'Linking Road, Bandra West';
  const customerAddress =
    `${order.deliveryAddress?.house ? order.deliveryAddress.house + ', ' : ''}${
      order.deliveryAddress?.area || 'Bandra West'
    }`;
  const payout = order.deliveryFee || 60;
  const items = order.items || [];

  const progressPercent = Math.round((secondsRemaining / autoCountdownSeconds) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-orange-500 overflow-hidden transform transition-all animate-scale-up">
        {/* Header with sound and timer */}
        <div className="bg-linear-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-bounce">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                Incoming Delivery Request
              </span>
              <h3 className="text-lg font-black text-white leading-tight">New Order Nearby!</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={soundEnabled ? 'Mute alert' : 'Unmute alert'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onDecline && onDecline(order._id)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Countdown Timer Line */}
        <div className="w-full bg-orange-100 h-2 overflow-hidden">
          <div
            className="bg-orange-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Earnings & Trip Summary */}
          <div className="flex items-center justify-between bg-orange-50/70 p-4 rounded-2xl border border-orange-200/60">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Guaranteed Payout</p>
              <p className="text-2xl font-black text-orange-600">₹{payout}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Est. Trip Distance</p>
              <p className="text-base font-black text-slate-800">3.4 km • 16 mins</p>
            </div>
          </div>

          {/* Route details */}
          <div className="space-y-3">
            {/* Pickup */}
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-amber-700">Pickup Location</p>
                <p className="font-extrabold text-slate-900">{restaurantName}</p>
                <p className="text-slate-500 line-clamp-1">{restaurantAddress}</p>
              </div>
            </div>

            {/* Connecting line */}
            <div className="ml-3.5 h-4 border-l-2 border-dashed border-slate-300" />

            {/* Dropoff */}
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Customer Dropoff</p>
                <p className="font-extrabold text-slate-900">
                  {order.customerDetails?.name || 'Customer'}
                </p>
                <p className="text-slate-500 line-clamp-1">{customerAddress}</p>
              </div>
            </div>
          </div>

          {/* Items Preview */}
          {items.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 block mb-1">
                Package Contents ({items.length} items):
              </span>
              <p className="text-slate-700 truncate font-medium">
                {items.map((i) => `${i.quantity}x ${i.name || i.food?.name || 'Dish'}`).join(', ')}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => onDecline && onDecline(order._id)}
              className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-colors"
            >
              Decline ({secondsRemaining}s)
            </button>

            <button
              type="button"
              onClick={() => onAccept && onAccept(order._id)}
              className="flex-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept & Start Navigation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
