import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, Loader2, Radio, Sparkles, Navigation } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OrderHistory from '../../components/order/OrderHistory';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import { fetchOrders, updateLiveOrderStatus } from '../../redux/slices/orderSlice';
import { orderService } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';

export default function MyOrders() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { orders, loading } = useSelector((state) => state.order);

  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Placed by mistake');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');

  const cancellationReasons = [
    'Placed by mistake',
    'Order taking too long to prepare',
    'Need to change delivery address',
    'Want to change food items / restaurant',
    'Other reason',
  ];

  useEffect(() => {
    dispatch(fetchOrders());

    if (socket) {
      const handleStatusChange = (updated) => {
        if (!updated) return;
        dispatch(updateLiveOrderStatus(updated));
      };

      socket.on('orderStatusChanged', handleStatusChange);
      return () => {
        socket.off('orderStatusChanged', handleStatusChange);
      };
    }
  }, [dispatch, socket]);

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setCancelReason('Placed by mistake');
    setCustomReason('');
    setCancelErrorMsg('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;
    setCancelling(true);
    setCancelErrorMsg('');
    try {
      const finalReason = cancelReason === 'Other reason' && customReason.trim() ? customReason : cancelReason;
      const res = await orderService.cancelOrder(selectedOrderToCancel._id, { reason: finalReason });
      
      if (res.data?.data) {
        dispatch(updateLiveOrderStatus(res.data.data));
      }
      dispatch(fetchOrders());

      setCancelSuccessMsg(`Order #${selectedOrderToCancel.orderId || selectedOrderToCancel._id} was cancelled.`);
      setSelectedOrderToCancel(null);
      setTimeout(() => setCancelSuccessMsg(''), 4000);
    } catch (err) {
      setCancelErrorMsg(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
          <p className="text-xs text-slate-500 font-medium">Track active deliveries and view past order history</p>
        </div>

        <Link
          to="/live-tracking"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105"
        >
          <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>Launch Live Order Tracker Demo</span>
        </Link>
      </div>

      {cancelSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {loading ? (
        <Skeleton type="list" count={4} />
      ) : (
        <OrderHistory
          orders={orders}
          loading={loading}
          onCancelOrder={handleOpenCancelModal}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedOrderToCancel)}
        onClose={() => !cancelling && setSelectedOrderToCancel(null)}
        title={`Cancel Order #${selectedOrderToCancel?.orderId || ''}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Are you sure you want to cancel this order?</p>
              <p className="text-[11px] text-red-600 mt-0.5">
                Once cancelled, the restaurant will stop food preparation and online payments will be refunded.
              </p>
            </div>
          </div>

          {cancelErrorMsg && (
            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold">
              {cancelErrorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Reason for Cancellation</label>
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
              onClick={() => setSelectedOrderToCancel(null)}
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
    </div>
  );
}
