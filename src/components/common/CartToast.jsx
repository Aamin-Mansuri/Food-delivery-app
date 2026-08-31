import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { clearNotificationMessage, toggleCartDrawer } from '../../redux/slices/cartSlice';

export default function CartToast() {
  const dispatch = useDispatch();
  const { notificationMessage, items } = useSelector((state) => state.cart);

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage, dispatch]);

  if (!notificationMessage) return null;

  const isWarning = notificationMessage.toLowerCase().includes('sold out') || notificationMessage.toLowerCase().includes('clear');

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between space-x-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center space-x-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {isWarning ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">{notificationMessage}</p>
          <p className="text-[10px] text-slate-400 font-medium">
            {items.reduce((acc, curr) => acc + curr.quantity, 0)} item(s) in cart
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={() => {
            dispatch(clearNotificationMessage());
            dispatch(toggleCartDrawer(true));
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
        <button
          onClick={() => dispatch(clearNotificationMessage())}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
