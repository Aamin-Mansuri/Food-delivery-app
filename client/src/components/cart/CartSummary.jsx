import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const CartSummary = ({
  items = [],
  itemTotal = 0,
  deliveryFee = 40,
  platformFee = 5,
  tax = 0,
  discount = 0,
  total = 0,
  onCheckout,
  isCheckingOut = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
      <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Bill Summary
      </h3>

      <div className="space-y-3 text-sm text-slate-600 mb-6">
        <div className="flex justify-between">
          <span>Item Total</span>
          <span className="font-semibold text-slate-800">₹{itemTotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Partner Fee</span>
          <span className="font-semibold text-slate-800">
            {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Platform Convenience Fee</span>
          <span className="font-semibold text-slate-800">₹{platformFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Govt Taxes & Charges (5% GST)</span>
          <span className="font-semibold text-slate-800">₹{tax}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl">
            <span>Coupon Discount</span>
            <span>- ₹{discount}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-base font-extrabold text-slate-900">
          <span>To Pay</span>
          <span className="text-xl text-orange-600 font-black">₹{total}</span>
        </div>
      </div>

      {onCheckout && (
        <Button
          onClick={onCheckout}
          isLoading={isCheckingOut}
          className="w-full py-3.5 text-base gap-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default CartSummary;
