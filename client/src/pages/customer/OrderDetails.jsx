import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Bike, MapPin, Phone, Star, ShieldAlert, XCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

import OrderTimeline from '../../components/order/OrderTimeline';
import RealTimeOrderTracker from '../../components/order/RealTimeOrderTracker';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

import { fetchOrderDetails, updateLiveOrderStatus } from '../../redux/slices/orderSlice';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { useSocket } from '../../hooks/useSocket';

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const socket = useSocket();

  const { currentOrder, loading } = useSelector((state) => state.order);

  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed by mistake');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const cancellationReasons = [
    'Placed by mistake',
    'Order taking too long to prepare',
    'Need to change delivery address',
    'Want to change food items / restaurant',
    'Other reason',
  ];

  useEffect(() => {
    dispatch(fetchOrderDetails(id));

    if (socket) {
      socket.emit('joinOrderRoom', id);

      const handleStatusChange = (updated) => {
        if (!updated) return;
        const incomingId = String(updated._id || updated.orderId).toLowerCase();
        const curId = String(id).replace(/^#/, '').toLowerCase();
        if (incomingId === curId || updated._id === id || updated.orderId === id) {
          dispatch(updateLiveOrderStatus(updated));
        }
      };

      socket.on('orderStatusChanged', handleStatusChange);
      return () => {
        socket.off('orderStatusChanged', handleStatusChange);
      };
    }

    const isCompleted = currentOrder?.orderStatus === 'DELIVERED' || currentOrder?.orderStatus === 'CANCELLED';
    let interval = null;

    if (!isCompleted) {
      interval = setInterval(() => {
        dispatch(fetchOrderDetails(id));
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, id, socket, currentOrder?.orderStatus]);

  const cleanId = id ? String(id).replace(/^#/, '').toLowerCase() : '';
  const isMatch =
    currentOrder &&
    (currentOrder._id === id ||
      currentOrder.orderId === id ||
      (currentOrder._id && String(currentOrder._id).toLowerCase() === cleanId) ||
      (currentOrder.orderId && String(currentOrder.orderId).toLowerCase() === cleanId));

  if (loading || (!currentOrder && !isMatch)) {
    return <Loader label="Fetching Live Order Details..." />;
  }

  if (!isMatch && !loading) {
    return (
      <main className="max-w-xl w-full mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">We couldn't locate order details for reference #{id}.</p>
        <Link to="/orders" className="inline-block bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs">
          View All My Orders
        </Link>
      </main>
    );
  }

  const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING'].includes(currentOrder.orderStatus);

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelErrorMsg('');
    try {
      const finalReason = cancelReason === 'Other reason' && customReason.trim() ? customReason : cancelReason;
      const targetId = currentOrder._id || id;
      const res = await orderService.cancelOrder(targetId, { reason: finalReason });
      
      if (res.data?.data) {
        dispatch(updateLiveOrderStatus(res.data.data));
      }
      dispatch(fetchOrderDetails(id));
      
      setCancelSuccessMsg('Your order has been cancelled successfully.');
      setCancelModalOpen(false);
      setTimeout(() => setCancelSuccessMsg(''), 4000);
    } catch (err) {
      setCancelErrorMsg(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const restId = currentOrder.restaurantDetails?._id || currentOrder.restaurant?._id || currentOrder.restaurant;
    try {
      await reviewService.createReview({
        restaurantId: restId,
        orderId: currentOrder._id || id,
        rating,
        comment,
      });
      setReviewSuccessMsg('Thank you for rating your food experience!');
      setReviewModal(false);
      setTimeout(() => setReviewSuccessMsg(''), 4000);
    } catch (e) {
      setReviewModal(false);
    }
  };

  const partner = currentOrder.deliveryPartnerDetails || currentOrder.deliveryPartnerId || (currentOrder.deliveryPartner ? { name: 'Vikram Singh (Rider)', phone: '+91 9820011223' } : null);

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/orders" className="inline-flex items-center space-x-2 text-xs font-bold text-orange-600 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Orders</span>
      </Link>

      {/* Success / Error Alerts */}
      {cancelSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {reviewSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reviewSuccessMsg}</span>
        </div>
      )}

      {/* Live Tracking Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              {currentOrder.orderStatus === 'CANCELLED' ? 'Cancelled Order' : 'Live Delivery Order'}
            </span>
            <h1 className="text-2xl font-black text-slate-900">Order #{currentOrder.orderId || currentOrder._id}</h1>
            {currentOrder.restaurantDetails && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">From: <span className="font-bold text-slate-700">{currentOrder.restaurantDetails.name}</span></p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  setCancelErrorMsg('');
                  setCancelModalOpen(true);
                }}
                className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 border border-red-200 transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}

            {currentOrder.orderStatus === 'DELIVERED' && (
              <button
                type="button"
                onClick={() => setReviewModal(true)}
                className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 shadow-xs flex items-center space-x-1 transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rate & Review Meal</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time WebSocket Order Tracker & Route Telemetry */}
        <RealTimeOrderTracker
          order={currentOrder}
          currentStatus={currentOrder.orderStatus}
          onStatusUpdate={(newStatus) => {
            dispatch(updateLiveOrderStatus({ ...currentOrder, orderStatus: newStatus }));
          }}
          enableSimulator={true}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Items */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Ordered Food Items
          </h3>
          <div className="divide-y divide-slate-100">
            {(currentOrder.items || []).map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{item.quantity}x {item.name}</p>
                  <p className="text-slate-400">₹{item.price} each</p>
                </div>
                <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{currentOrder.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>₹{currentOrder.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Taxes</span>
              <span>₹{currentOrder.tax}</span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-₹{currentOrder.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Total Amount</span>
              <span>₹{currentOrder.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Right: Partner & Address */}
        <div className="space-y-6">
          
          {/* Delivery Fleet Partner Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Bike className="w-5 h-5 text-orange-600" />
              <span>Delivery Fleet Partner</span>
            </h3>

            {currentOrder.orderStatus === 'CANCELLED' ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                Delivery cancelled because the order is no longer active.
              </div>
            ) : partner ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {partner.name || 'Vikram Singh (Rider)'}
                  </h4>
                  <p className="text-xs text-emerald-600 font-bold">Live delivery tracking active</p>
                  <p className="text-xs font-bold text-orange-600 mt-1 flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{partner.phone || '+91 9711223344'}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs font-bold text-orange-800">Assigning nearest delivery rider...</p>
                <p className="text-[11px] text-orange-600 mt-0.5">Your order is being prepared by the restaurant kitchen.</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>Delivery Address</span>
            </h3>
            <p className="text-xs font-bold text-slate-800">
              {currentOrder.deliveryAddress?.house ? `${currentOrder.deliveryAddress.house}, ` : ''}{currentOrder.deliveryAddress?.street}
            </p>
            <p className="text-xs text-slate-500">{currentOrder.deliveryAddress?.area}, {currentOrder.deliveryAddress?.city} - {currentOrder.deliveryAddress?.pincode}</p>
          </div>

        </div>

      </div>

      {/* In-App Cancel Order Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => !cancelling && setCancelModalOpen(false)} title="Cancel Order">
        <div className="space-y-4">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to cancel this order?</p>
              <p className="text-[11px] text-red-600 mt-0.5">
                Once cancelled, the kitchen will stop preparing your meal and any online payment will be refunded.
              </p>
            </div>
          </div>

          {cancelErrorMsg && (
            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold">
              {cancelErrorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Please select a reason for cancellation</label>
            <div className="space-y-2">
              {cancellationReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    cancelReason === reason
                      ? 'border-orange-500 bg-orange-50/50 font-bold text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {cancelReason === 'Other reason' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tell us more</label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe why you want to cancel..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={cancelling}
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancel</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Rate Your Meal">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-500"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Review Comment</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the food quality, temperature, packaging, and delivery promptness?"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-700"
          >
            Submit Review
          </button>
        </form>
      </Modal>
    </div>
  );
}
