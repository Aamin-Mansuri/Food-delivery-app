import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Radio,
  Phone,
  MessageSquare,
  MapPin,
} from 'lucide-react';

const STATUS_STAGES = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    subtitle: 'Payment confirmed & order sent to kitchen',
    etaMinutes: 35,
    progress: 10,
    icon: Clock,
    badgeText: 'Received',
  },
  {
    key: 'CONFIRMED',
    label: 'Kitchen Confirmed',
    subtitle: 'Restaurant acknowledged and queued ticket',
    etaMinutes: 30,
    progress: 25,
    icon: CheckCircle2,
    badgeText: 'Accepted',
  },
  {
    key: 'PREPARING',
    label: 'Preparing Your Food',
    subtitle: 'Chef is cooking fresh with quality ingredients',
    etaMinutes: 22,
    progress: 50,
    icon: ChefHat,
    badgeText: 'In the Kitchen',
  },
  {
    key: 'READY_FOR_PICKUP',
    label: 'Packed & Ready',
    subtitle: 'Packed in thermal insulated bag, rider arriving',
    etaMinutes: 15,
    progress: 68,
    icon: PackageCheck,
    badgeText: 'Awaiting Rider',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    subtitle: 'Rider is on the way to your delivery address',
    etaMinutes: 8,
    progress: 85,
    icon: Bike,
    badgeText: 'On the Way',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    subtitle: 'Handed over at doorstep. Enjoy your meal!',
    etaMinutes: 0,
    progress: 100,
    icon: ShoppingBag,
    badgeText: 'Delivered',
  },
];

export default function RealTimeOrderTracker({
  order,
  currentStatus: propStatus,
  onStatusUpdate,
}) {
  // Normalize initial status
  const normalizedInitial = (propStatus || order?.orderStatus || 'PREPARING').toUpperCase();
  const [currentStatus, setCurrentStatus] = useState(
    STATUS_STAGES.some((s) => s.key === normalizedInitial) ? normalizedInitial : 'PREPARING'
  );

  // Sync with prop status if modified externally
  useEffect(() => {
    if (propStatus && propStatus !== currentStatus) {
      setCurrentStatus(propStatus);
    }
  }, [propStatus]);

  // Helper to change stage
  const changeStage = (newStatusKey) => {
    setCurrentStatus(newStatusKey);
    if (onStatusUpdate) {
      onStatusUpdate(newStatusKey);
    }
  };

  // Current stage details
  const currentStageIndex = Math.max(
    0,
    STATUS_STAGES.findIndex((s) => s.key === currentStatus)
  );
  const activeStage = STATUS_STAGES[currentStageIndex] || STATUS_STAGES[0];
  const isDelivered = currentStatus === 'DELIVERED';
  const etaRemaining = activeStage.etaMinutes;

  // Restaurant & Rider metadata fallback
  const restaurantName =
    order?.restaurantDetails?.name || order?.restaurant?.name || 'Gourmet Bistro & Pizzeria';
  const deliveryAddress =
    order?.deliveryAddress?.street || order?.deliveryAddress?.area || 'Flat 402, Sunshine Heights, Bandra West';
  const partnerName =
    order?.deliveryPartnerDetails?.name || order?.deliveryPartner?.name || 'Vikram Singh';
  const partnerPhone =
    order?.deliveryPartnerDetails?.phone || order?.deliveryPartner?.phone || '+91 98200 11223';

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100 transition-all">
      {/* 1. Header Bar with Real-Time Connection Indicator */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Live Order Tracking</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                Order #{order?.orderId || (order?._id ? order._id.substring(0, 6) : 'ORD-9842')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              {activeStage.label}
            </h2>
            <p className="text-xs text-slate-400">{activeStage.subtitle}</p>
          </div>

          {/* ETA Card */}
          <div className="flex items-center space-x-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 px-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isDelivered ? 'Total Time' : 'Estimated Arrival'}
              </p>
              <p className="text-lg font-black text-white">
                {isDelivered ? 'Delivered' : `${etaRemaining} mins`}
              </p>
            </div>
          </div>
        </div>

        {/* Global Stage Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>Overall Progress</span>
            <span className="text-orange-400">{activeStage.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${activeStage.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Pickup & Dropoff Address Summary Cards */}
      <div className="p-5 sm:p-6 bg-slate-50/60 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Pickup From</p>
            <p className="text-xs font-extrabold text-slate-900 truncate">{restaurantName}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Deliver To</p>
            <p className="text-xs font-extrabold text-slate-900 truncate">{deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* 3. Stepper Milestones */}
      <div className="p-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">
          Milestone Timeline
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {STATUS_STAGES.map((stage, idx) => {
            const isPassed = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            const Icon = stage.icon;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => changeStage(stage.key)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-200 scale-[1.02]'
                    : isPassed
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                      isCurrent
                        ? 'bg-orange-200 text-orange-800'
                        : isPassed
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPassed ? 'Done' : isCurrent ? 'Active' : 'Queued'}
                  </span>
                </div>

                <div>
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-orange-950'
                        : isPassed
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium line-clamp-1">
                    {stage.badgeText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Delivery Agent / Rider Card */}
      <div className="p-6 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-base shadow-xs shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-slate-900 text-sm">{partnerName}</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                4.9 ★ Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hero Electric Scooter • <span className="font-semibold text-slate-700">MH-02-BQ-8910</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`tel:${partnerPhone}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            <span>Call Rider</span>
          </a>
          <button
            type="button"
            onClick={() => alert(`Message sent to ${partnerName}: "Rider notified to leave order at the door!"`)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
