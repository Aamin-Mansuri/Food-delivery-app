import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  ArrowRight,
  Tag,
  Trash2,
  CheckCircle2,
  Heart,
  Leaf,
  BellRing,
  DoorClosed,
  PhoneOff,
  Sparkles,
} from 'lucide-react';
import { toggleCartDrawer, clearCart } from '../../redux/slices/cartSlice';
import CartItem from './CartItem';
import { couponService } from '../../services/couponService';
import { soundFX } from '../../utils/audioFeedback';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurant, items, isDrawerOpen } = useSelector((state) => state.cart);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [tipAmount, setTipAmount] = useState(30);
  const [noCutlery, setNoCutlery] = useState(true);
  const [deliveryInstruction, setDeliveryInstruction] = useState('Leave at door');

  if (!isDrawerOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const deliveryFee = restaurant?.deliveryFee ?? 40;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + tax + tipAmount - discount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    try {
      const res = await couponService.validateCoupon({ code: couponCode, cartAmount: subtotal });
      soundFX.playSuccess();
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: res.data.discount });
      setCouponError('');
    } catch (err) {
      soundFX.playPop();
      setCouponError(err.message);
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    soundFX.playSuccess();
    dispatch(toggleCartDrawer(false));
    navigate('/checkout', {
      state: {
        coupon: appliedCoupon?.code,
        discount,
        tip: tipAmount,
        noCutlery,
        deliveryInstruction,
      },
    });
  };

  const tipOptions = [
    { label: '₹20 😊', amount: 20 },
    { label: '₹30 🚀', amount: 30 },
    { label: '₹50 👑', amount: 50 },
    { label: 'Custom', amount: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">Your Food Order</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {restaurant ? restaurant.name : 'No items added'}
                </p>
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleCartDrawer(false))}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Items */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-400 mb-4 shadow-xs">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 font-display">Your cart is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Explore top restaurants nearby and add delicious artisanal dishes to start your order!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Items ({items.length})
                  </span>
                  <button
                    onClick={() => {
                      soundFX.playPop();
                      dispatch(clearCart());
                    }}
                    className="text-xs text-red-500 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <CartItem key={item?.food?._id || item?.food?.id || item?._id || idx} item={item} />
                  ))}
                </div>

                {/* Delivery Hero Tip Option */}
                <div className="bg-amber-500/5 border border-amber-900/10 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center space-x-1.5 font-mono uppercase text-[11px] text-amber-900">
                      <Heart className="w-3.5 h-3.5 text-orange-600 fill-current" />
                      <span>Tip your Delivery Partner</span>
                    </span>
                    <span className="text-orange-700 font-black font-mono">
                      {tipAmount > 0 ? `+₹${tipAmount}` : 'None'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    100% of the tip goes directly to your rider.
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {tipOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          soundFX.playPop();
                          setTipAmount(opt.amount);
                        }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all border text-center ${
                          tipAmount === opt.amount
                            ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop-off Instructions */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono">
                    Drop-off Instructions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { text: 'Leave at door', icon: DoorClosed },
                      { text: 'Ring door bell', icon: BellRing },
                      { text: 'Avoid phone call', icon: PhoneOff },
                      { text: 'Hand to guard', icon: Sparkles },
                    ].map((inst) => {
                      const Icon = inst.icon;
                      const active = deliveryInstruction === inst.text;
                      return (
                        <button
                          key={inst.text}
                          type="button"
                          onClick={() => {
                            soundFX.playPop();
                            setDeliveryInstruction(inst.text);
                          }}
                          className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-bold transition-all border text-left ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{inst.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Eco-Friendly Cutlery Toggle */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Opt-out of plastic cutlery</p>
                      <p className="text-[10px] text-emerald-700">Join our zero-plastic green pledge 🌱</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={noCutlery}
                    onChange={(e) => {
                      soundFX.playPop();
                      setNoCutlery(e.target.checked);
                    }}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Coupon Form */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1 font-mono">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    <span>Promo or Discount Coupon</span>
                  </p>

                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. FOODRUSH50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 uppercase font-mono bg-slate-50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-2xl hover:bg-orange-600 transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>

                  {appliedCoupon && (
                    <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Coupon {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discount}</span>
                    </div>
                  )}

                  {couponError && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Item Subtotal</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-mono">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST Taxes (5%)</span>
                    <span className="font-mono">₹{tax}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-orange-600 font-bold">
                      <span>Rider Tip</span>
                      <span className="font-mono">+₹{tipAmount}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount</span>
                      <span className="font-mono">-₹{discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                    <span>To Pay</span>
                    <span className="font-mono text-base font-black text-orange-600">₹{grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-white">
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-between text-sm active:scale-98 cursor-pointer uppercase tracking-wider"
              >
                <div>
                  <span className="block text-[10px] uppercase font-mono opacity-90">Grand Total</span>
                  <span className="text-base font-black font-mono">₹{grandTotal}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

