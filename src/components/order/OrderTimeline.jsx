import React from 'react';
import { 
  Check, 
  Clock, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  AlertCircle, 
  PackageCheck, 
  Flame, 
  Navigation,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function OrderTimeline({ 
  currentStatus = 'PLACED', 
  statusTimeline = [],
  restaurantName = 'Kitchen',
  estimatedTime = '25-35 mins'
}) {
  // Mapping internal statuses into ordered customer stages
  const steps = [
    {
      key: 'PLACED',
      label: 'Order Placed',
      sublabel: 'We received your order',
      icon: Clock,
      statusGroup: ['PLACED'],
      activeMessage: 'Your order has been sent to the kitchen',
    },
    {
      key: 'PROCESSING',
      label: 'Kitchen Confirmed',
      sublabel: 'Order accepted & queued',
      icon: CheckCircle2,
      statusGroup: ['CONFIRMED'],
      activeMessage: `${restaurantName} accepted your order`,
    },
    {
      key: 'PREPARING',
      label: 'Preparing Food',
      sublabel: 'Chef is cooking fresh',
      icon: ChefHat,
      statusGroup: ['PREPARING'],
      activeMessage: 'Fresh ingredients are being prepared and cooked',
    },
    {
      key: 'READY',
      label: 'Ready for Pickup',
      sublabel: 'Packed & awaiting rider',
      icon: PackageCheck,
      statusGroup: ['READY_FOR_PICKUP', 'PICKED_UP'],
      activeMessage: 'Order packed in insulated bags, rider ready',
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      sublabel: 'Rider on the way',
      icon: Bike,
      statusGroup: ['OUT_FOR_DELIVERY'],
      activeMessage: 'Delivery partner is speeding towards your doorstep',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      sublabel: 'Enjoy your meal!',
      icon: ShoppingBag,
      statusGroup: ['DELIVERED'],
      activeMessage: 'Order delivered successfully. Bon appétit!',
    },
  ];

  const statusToStepIndex = {
    PLACED: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    READY_FOR_PICKUP: 3,
    PICKED_UP: 3,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5,
  };

  const currentStepIndex = statusToStepIndex[currentStatus] !== undefined ? statusToStepIndex[currentStatus] : 0;
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="bg-red-50/90 border border-red-200 rounded-3xl p-6 flex items-start space-x-4 text-red-900 shadow-sm animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-black uppercase tracking-wider">
              Cancelled
            </span>
            <h4 className="font-extrabold text-base text-red-950">This Order Has Been Cancelled</h4>
          </div>
          <p className="text-xs text-red-700 leading-relaxed">
            The kitchen has stopped preparation. If you paid online via card/UPI/wallet, the refund will be credited back within 3-5 business days.
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentage for progress bar
  const progressPercent = (currentStepIndex / (steps.length - 1)) * 100;
  const currentStepObj = steps[currentStepIndex] || steps[0];

  return (
    <div className="space-y-6 pt-1">
      {/* Dynamic Status Live Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white shadow-md">
        {/* Subtle Background Glow Animation */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              {currentStatus === 'PREPARING' ? (
                <Flame className="w-6 h-6 text-amber-200 animate-bounce" />
              ) : currentStatus === 'OUT_FOR_DELIVERY' ? (
                <Navigation className="w-6 h-6 text-white animate-pulse" />
              ) : currentStatus === 'DELIVERED' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              ) : (
                <Sparkles className="w-6 h-6 text-amber-100" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-100">
                  {currentStatus === 'DELIVERED' ? 'Order Completed' : 'Live Status Tracker'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                {currentStepObj.label}
              </h3>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                {currentStepObj.activeMessage}
              </p>
            </div>
          </div>

          {currentStatus !== 'DELIVERED' && (
            <div className="flex md:flex-col items-center md:items-end justify-between border-t border-white/20 md:border-t-0 pt-3 md:pt-0">
              <span className="text-[11px] font-bold text-orange-100 uppercase tracking-wider">Estimated Delivery</span>
              <span className="text-base font-black text-white bg-black/20 px-3 py-1 rounded-xl backdrop-blur-xs">
                {estimatedTime}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Step-by-Step Stepper */}
      <div className="px-2 py-4">
        {/* Desktop / Tablet Horizontal Timeline */}
        <div className="hidden sm:block relative">
          {/* Background Track */}
          <div className="absolute top-5 left-6 right-6 h-1.5 bg-slate-100 rounded-full -z-0" />
          
          {/* Dynamic Active Progress Fill */}
          <div
            className="absolute top-5 left-6 h-1.5 bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-700 ease-out -z-0"
            style={{ width: `calc(${progressPercent}% * 0.88)` }}
          />

          <div className="relative z-10 grid grid-cols-6 gap-2">
            {steps.map((step, idx) => {
              const isPassed = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const isPending = currentStepIndex < idx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center text-center group">
                  {/* Step Bubble */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow-lg ring-4 ring-orange-200 scale-110'
                        : isPassed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-3 space-y-0.5">
                    <p
                      className={`text-xs leading-tight transition-colors ${
                        isCurrent
                          ? 'font-black text-orange-600'
                          : isPassed
                          ? 'font-bold text-slate-900'
                          : 'font-semibold text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                      {step.sublabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Stepper View */}
        <div className="sm:hidden space-y-4">
          {steps.map((step, idx) => {
            const isPassed = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            const isPending = currentStepIndex < idx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start space-x-3.5 relative">
                {idx !== steps.length - 1 && (
                  <div
                    className={`absolute left-4.5 top-9 bottom-[-16px] w-0.5 ${
                      isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
                
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all ${
                    isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-md'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs ${
                        isCurrent
                          ? 'font-black text-orange-600'
                          : isPassed
                          ? 'font-bold text-slate-900'
                          : 'font-medium text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
