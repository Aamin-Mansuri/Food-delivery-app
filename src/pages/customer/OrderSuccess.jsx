import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Truck, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import API from '../../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const displayId = !id || id === 'undefined' ? 'ord_1001' : id;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id && id !== 'undefined') {
      API.get(`/orders/${id}`)
        .then((res) => {
          setOrder(res.data.data);
        })
        .catch((err) => console.error("Failed to fetch order", err));
    }
  }, [id]);

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-8">
      {/* Celebration Icon */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
        <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-500 animate-bounce" />
        <Heart className="absolute -bottom-1 -left-1 w-5 h-5 text-rose-500" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Yum! Order Confirmed! 🎉
        </h1>
        <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
          Your delicious meal request has been safely sent to the kitchen. The chef is currently preheating the stove with absolute love and care!
        </p>
      </div>

      {/* Dynamic Detail Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl text-left space-y-6 relative overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/40 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Order ID (Receipt No.)</p>
              <p className="text-xl font-mono font-black text-orange-600 mt-0.5">#{order ? order.orderId : 'FR-XXXXX'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">System Reference ID</p>
              <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">{displayId}</p>
            </div>
          </div>
          <div className="bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-100/70 text-right self-start sm:self-auto">
            <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider">Estimated Delivery</p>
            <p className="text-xs font-black text-slate-900 mt-0.5">⏱️ 25 - 35 Mins</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Next Steps: What Happens Now?</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/80">
              <span className="text-lg">👨‍🍳</span>
              <h5 className="font-extrabold text-slate-900 mt-2">1. Kitchen Prep</h5>
              <p className="text-slate-500 text-[11px] mt-1">Chef accepts the order & prepares it hot & fresh.</p>
            </div>
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/80">
              <span className="text-lg">🛵</span>
              <h5 className="font-extrabold text-slate-900 mt-2">2. Partner Pickup</h5>
              <p className="text-slate-500 text-[11px] mt-1">A verified rider picks up the sealed hygienic package.</p>
            </div>
            <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/80">
              <span className="text-lg">🚪</span>
              <h5 className="font-extrabold text-slate-900 mt-2">3. Doorstep Handover</h5>
              <p className="text-slate-500 text-[11px] mt-1">Rider delivers it straight to your selected location.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/orders/${displayId}`}
          className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black px-8 py-4 rounded-2xl shadow-md hover:shadow-lg hover:brightness-105 transition-all text-xs flex items-center justify-center space-x-2"
        >
          <Truck className="w-4.5 h-4.5" />
          <span>Track Live Order Progress</span>
        </Link>
        <Link
          to="/"
          className="bg-white border border-slate-200 text-slate-700 font-extrabold px-8 py-4 rounded-2xl hover:bg-slate-50/80 transition-all text-xs flex items-center justify-center space-x-1.5"
        >
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span>Go Back to Marketplace</span>
        </Link>
      </div>
    </div>
  );
}

