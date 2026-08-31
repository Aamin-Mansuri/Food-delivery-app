import React from 'react';
import { Tag, Copy, Check, Sparkles, Percent } from 'lucide-react';
import { soundFX } from '../../utils/audioFeedback';

export default function CouponCard({ coupon, onApply }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    soundFX.playSuccess();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onApply) onApply(coupon.code);
  };

  return (
    <div className="relative bg-gradient-to-r from-white via-amber-50/40 to-orange-50/30 border border-amber-900/15 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.08)] hover:border-orange-400/50 transition-all duration-300 group overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Perforated VIP Ticket Notch Effect */}
      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FAF8F5] border-r border-amber-900/20" />
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FAF8F5] border-l border-amber-900/20" />

      <div className="flex items-center space-x-3.5 relative z-10 pl-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
          <Percent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-black text-slate-900 text-xs tracking-wider uppercase bg-white px-2.5 py-0.5 rounded-lg border border-amber-200/80 shadow-2xs">
              {coupon.code}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-md font-mono">
              {coupon.discountPercentage ? `${coupon.discountPercentage}% OFF` : `₹${coupon.discountAmount} OFF`}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-bold mt-1 line-clamp-1">{coupon.description}</p>
          <p className="text-[10px] text-slate-400 font-medium">Orders above ₹{coupon.minimumOrder || 199} • Instant claim</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all shrink-0 flex items-center space-x-1.5 shadow-sm relative z-10 active:scale-95 cursor-pointer uppercase tracking-wider ${
          copied
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : 'bg-slate-900 text-white hover:bg-orange-600 shadow-slate-900/20'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Apply</span>
          </>
        )}
      </button>
    </div>
  );
}
