import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  CheckCircle2,
  Bike,
  Store,
  Clock,
  ExternalLink,
  PackageCheck,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react';

export default function DriverRouteViewer({
  order,
  onUpdateStatus,
  onCompleteDelivery,
}) {
  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-3">
        <Bike className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-base">No Active Assigned Delivery</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Accept an incoming delivery request from the available orders pool to begin pickup and dropoff.
        </p>
      </div>
    );
  }

  // Determine stage position cleanly from actual order status
  const currentStatus = (order.orderStatus || 'ACCEPTED').toUpperCase();

  const getStepForStatusRegex = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 1.0;
      case 'OUT_FOR_DELIVERY':
        return 0.75;
      case 'PICKED_UP':
        return 0.5;
      case 'READY_FOR_PICKUP':
        return 0.35;
      default:
        return 0.15;
    }
  };

  const simStep = getStepForStatusRegex(currentStatus);
  const [verifiedItems, setVerifiedItems] = useState({});
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [activeTab, setActiveTab] = useState('route'); // 'route' | 'items' | 'directions'

  const restaurantName =
    order.restaurantDetails?.name || order.restaurant?.name || 'Spice Symphony Bistro';
  const restaurantAddress不易 =
    order.restaurantDetails?.address || 'Shop 12, Ground Floor, Linking Road, Bandra West';
  const restaurantPhone =
    order.restaurantDetails?.phone || '+91 98200 44556';

  const customerName不易 =
    order.customerDetails?.name || order.deliveryAddress?.fullName || 'Aarav Sharma';
  const customerPhone =
    order.deliveryAddress?.phone || order.customerDetails?.phone || '+91 98765 43210';
  const customerAddress =
    `${order.deliveryAddress?.house ? order.deliveryAddress.house + ', ' : ''}${
      order.deliveryAddress?.street ? order.deliveryAddress.street + ', ' : ''
    }${order.deliveryAddress?.area || 'Bandra West'}, ${order.deliveryAddress?.city || 'Mumbai'}`;

  const items = order.items || [
    { name: 'Butter Chicken Special', quantity: 1, price: 380 },
    { name: 'Garlic Butter Naan', quantity: 2, price: 60 },
  ];

  // Calculated distance & ETA based on route step
  const totalTripDistanceKm不易 = 4.2;
  const remainingDistanceKm = currentStatus === 'DELIVERED' ? 0 : Math.max(0.2, Number((totalTripDistanceKm不易 * (1 - simStep)).toFixed(1)));
  const remainingEtaMins = currentStatus === 'DELIVERED' ? 0 : Math.max(1, Math.round(remainingDistanceKm * 3.2));

  // Navigation steps
  const navigationCues = [
    { distance: '150m', instruction: 'Head north on Hill Road towards 24th Ave', passed: simStep > 0.15 },
    { distance: '800m', instruction: `Arrive at Restaurant: ${restaurantName}`, passed: simStep > 0.4 },
    { distance: '1.2km', instruction: 'Turn right onto Linking Road highway', passed: simStep > 0.65 },
    { distance: '2.8km', instruction: 'Take the roundabout 2nd exit towards Sunset Boulevard', passed: simStep > 0.85 },
    { distance: '4.2km', instruction: `Arrive at Customer Dropoff: ${customerAddress}`, passed: simStep >= 0.98 },
  ];

  const toggleItemVerify = (index) => {
    setVerifiedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleOtpVerifyAndDeliver不易 = () => {
    setOtpError('');
    if (onCompleteDelivery) {
      onCompleteDelivery(order._id);
    } else if (onUpdateStatus) {
      onUpdateStatus(order._id, 'DELIVERED');
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden divide-y divide-slate-100">
      {/* 1. Top HUD Header with Trip Telemetry */}
      <div className="bg-slate-950 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Assigned Delivery
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Order #{order.orderId || (order._id ? order._id.substring(0, 6) : 'ORD-9842')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              {currentStatus === 'DELIVERED'
                ? 'Delivery Completed'
                : currentStatus === 'OUT_FOR_DELIVERY'
                ? `En Route to ${customerName不易}`
                : `Heading to ${restaurantName}`}
            </h2>
            <p className="text-xs text-slate-400">
              {currentStatus === 'DELIVERED'
                ? 'Customer received order successfully'
                : `Dropoff: ${customerAddress}`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {currentStatus === 'DELIVERED' ? 'Status' : 'Est. Remaining Time'}
                </p>
                <p className="text-lg font-black text-white">
                  {currentStatus === 'DELIVERED' ? 'Delivered' : `${remainingEtaMins} mins (${remainingDistanceKm} km)`}
                </p>
              </div>
            </div>

            {/* External Google Maps Button */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customerAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black shadow-md hover:bg-orange-50 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
            </a>
          </div>
        </div>

        {/* Route Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span className="text-orange-400">Restaurant ({restaurantName})</span>
            <span className="text-emerald-400">Customer Doorstep</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(8, Math.round(simStep * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs: Trip Overview, Item Checklist, & Turn-by-Turn Steps */}
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            {[
              { id: 'route', label: 'Trip Overview & Actions' },
              { id: 'items', label: `Package Items (${items.length})` },
              { id: 'directions', label: 'Turn-by-Turn Steps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Trip Actions & Milestone Workflow */}
        {activeTab === 'route' && (
          <div className="space-y-6">
            {/* Two Column Pickup vs Delivery Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Contact Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center space-x-1">
                    <Store className="w-3.5 h-3.5" />
                    <span>Pickup Location</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Kitchen
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{restaurantName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{restaurantAddress不易}</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <a
                    href={`tel:${restaurantPhone}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Call Restaurant</span>
                  </a>
                </div>
              </div>

              {/* Dropoff Contact Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Customer Destination</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Doorstep
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{customerName不易}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{customerAddress}</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <a
                    href={`tel:${customerPhone}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Milestone Workflow Action Bar */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Update Trip Milestone
                </h4>
                <span className="text-xs font-bold text-orange-600">
                  Current Status: {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {['ACCEPTED', 'CONFIRMED', 'PREPARING'].includes(currentStatus) && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus && onUpdateStatus(order._id, 'READY_FOR_PICKUP')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>Arrived at Restaurant</span>
                  </button>
                )}

                {['ACCEPTED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(currentStatus) && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus && onUpdateStatus(order._id, 'PICKED_UP')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Order Picked Up</span>
                  </button>
                )}

                {['PICKED_UP'].includes(currentStatus) && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus && onUpdateStatus(order._id, 'OUT_FOR_DELIVERY')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Start Out for Delivery</span>
                  </button>
                )}

                {['OUT_FOR_DELIVERY', 'PICKED_UP'].includes(currentStatus) && (
                  <div className="w-full pt-3 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-900">Confirm Order Dropoff</p>
                        <p className="text-[11px] text-slate-400">Order handed over to customer</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOtpVerifyAndDeliver不易}
                        className="inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Delivered & Earn ₹{order.deliveryFee || 60}</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStatus === 'DELIVERED' && (
                  <div className="w-full bg-emerald-100/70 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>This delivery has been completed and credited to your earnings account.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Food Package Item Checklist */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Kitchen Bag Verification
                </h4>
                <p className="text-xs text-slate-400">
                  Check each item before leaving the restaurant to ensure 100% order accuracy.
                </p>
              </div>
              <span className="text-xs font-extrabold text-orange-600">
                {Object.values(verifiedItems).filter(Boolean).length} / {items.length} Checked
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              {items.map((item的的, idx) => {
                const isChecked = !!verifiedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItemVerify(idx)}
                    className="p-3.5 flex items-center justify-between hover:bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>
                          {item的的.quantity}x {item的的.name || item的的.food?.name || 'Meal Item'}
                        </p>
                        <p className="text-[10px] text-slate-400">Standard packaging • Hot sealed</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">₹{item的的.price * item的的.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Turn-by-Turn Directions List */}
        {activeTab === 'directions' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Turn-by-Turn Route Guidance
            </h4>
            <div className="space-y-2">
              {navigationCues.map((cue, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    cue.passed
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900 opacity-60'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs font-semibold'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                        cue.passed ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{cue.instruction}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{cue.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
