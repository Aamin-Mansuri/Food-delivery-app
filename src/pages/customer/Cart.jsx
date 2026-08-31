import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Tag } from 'lucide-react';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CartItem from '../../components/cart/CartItem';
import { clearCart } from '../../redux/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurant, items } = useSelector((state) => state.cart);

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const deliveryFee = restaurant?.deliveryFee ?? 40;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">Your Shopping Cart</h1>
          {items.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-xs text-red-500 hover:underline flex items-center space-x-1 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your cart is currently empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore nearby kitchens and add delicious dishes to your order.
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center space-x-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-700 transition-colors"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 space-y-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Items from {restaurant?.name || 'Kitchen'}
              </h3>
              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <CartItem key={item.food?._id || item.food?.id || idx} item={item} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4 h-fit shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                Order Bill Summary
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Taxes (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>To Pay</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all text-xs flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
