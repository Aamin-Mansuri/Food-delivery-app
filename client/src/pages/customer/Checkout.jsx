import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, ShieldCheck, ArrowRight, Plus } from 'lucide-react';

import Modal from '../../components/common/Modal';

import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { clearCart } from '../../redux/slices/cartSlice';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { restaurant, items = [] } = useSelector((state) => state.cart || {});
  const { user } = useSelector((state) => state.auth || {});

  const couponCode = location.state?.coupon || null;
  const couponDiscount = location.state?.discount || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [loading, setLoading] = useState(false);

  // Address Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    area: '',
    city: 'Mumbai',
    pincode: '',
  });

  useEffect(() => {
    addressService.getAddresses().then((res) => {
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setAddresses(list);
        if (list.length > 0) {
          setSelectedAddress(list[0]);
        }
      }
    }).catch((err) => {
      console.warn('Failed to load addresses:', err);
    });
  }, []);

  const validItems = items.filter((i) => i && (i.food || i.name));
  const subtotal = validItems.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1), 0);
  const deliveryFee = restaurant?.deliveryFee ?? 40;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = Math.max(0, subtotal + deliveryFee + tax - couponDiscount);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.createAddress(newAddr);
      const created = res.data?.data || res.data;
      if (created) {
        setAddresses((prev) => [...prev, created]);
        setSelectedAddress(created);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (validItems.length === 0) {
      alert('Your cart is empty. Please add some items to order.');
      navigate('/restaurants');
      return;
    }

    if (!selectedAddress) {
      alert('Please select or add a delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        restaurantId: restaurant?._id || restaurant?.id || restaurant || 'rest_001',
        items: validItems.map((i) => ({
          foodId: i.food?._id || i.food?.id || i.foodId || i.id || 'food_001',
          quantity: i.quantity || 1,
          price: i.price || 0,
          name: i.food?.name || i.name || 'Food Item',
        })),
        deliveryAddress: selectedAddress,
        paymentMethod,
        couponCode,
        subtotal,
        deliveryFee,
        tax,
        discount: couponDiscount,
        totalAmount,
      };

      const res = await orderService.createOrder(orderPayload);
      dispatch(clearCart());
      const newOrderObj = res.data?.data || res.data;
      const targetId = newOrderObj?._id || newOrderObj?.orderId || 'ord_1001';
      navigate(`/order-success/${targetId}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Visual Header & Step Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Checkout Summary</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Review your details, choose a secure payment, and place your fresh order.</p>
        </div>
        
        {/* Simple Progress stepper */}
        <div className="flex items-center space-x-3 text-xs bg-slate-50 p-2 rounded-2xl border border-slate-100/80">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-orange-100 text-orange-900 font-bold rounded-xl">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Address</span>
          </div>
          <span className="text-slate-300 font-bold">&rarr;</span>
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-orange-100 text-orange-900 font-bold rounded-xl">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Payment</span>
          </div>
          <span className="text-slate-300 font-bold">&rarr;</span>
          <div className="flex items-center space-x-1 px-2 text-slate-400 font-medium">
            <span>Confirm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Address & Payment */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Step 1: Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Select Delivery Address</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Where should we deliver your hot food?</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-600 px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <p className="text-xs text-slate-500 font-semibold">No addresses saved yet. Please add a delivery address to place your order.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Create New Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?._id === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer relative transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/20 shadow-xs ring-2 ring-orange-500/40'
                          : 'border-slate-100 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 bg-orange-600 text-white rounded-full p-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="text-[9px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        {addr.title}
                      </span>
                      <p className="text-xs font-black text-slate-900 mt-2.5">{addr.street}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{addr.area}, {addr.city} - {addr.pincode}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Payment Options */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Choose Payment Method</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Safe and secured transactions guaranteed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/40'
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'ONLINE' ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Online Instant Payment</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pay via Google Pay, PhonePe, UPI, Credit or Debit cards.</p>
                  <span className="inline-block mt-2 text-[9px] bg-orange-100/70 text-orange-800 font-extrabold px-2 py-0.5 rounded">
                    ⚡ Instant Discount Available
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/40'
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${paymentMethod === 'COD' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pay in cash or UPI when the rider hands over your fresh meal.</p>
                  <span className="inline-block mt-2 text-[9px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded">
                    💵 Keep change ready
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Secure Checkout Visual Trust Seal */}
          <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 flex items-center space-x-3 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              Your security is our absolute priority. We use standard 256-bit encryption. Freshly sourced ingredients, sanitized kitchens, and contactless delivery.
            </p>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-5 h-fit relative">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-base">
              Order Summary
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              From {restaurant?.name || 'Kitchen'} • {items.length} unique items
            </span>
          </div>

          <div className="divide-y divide-slate-100/80 max-h-56 overflow-y-auto pr-1">
            {validItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center font-medium">No items in your cart</p>
            ) : (
              validItems.map((i, idx) => {
                const foodName = i.food?.name || i.name || 'Food Item';
                const foodKey = i.food?._id || i.food?.id || i._id || idx;
                const qty = i.quantity || 1;
                const unitPrice = i.price || 0;
                return (
                  <div key={foodKey} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{foodName}</span>
                      <p className="text-[10px] text-slate-400 font-bold">Qty: {qty} • ₹{unitPrice} each</p>
                    </div>
                    <span className="font-black text-slate-900 text-sm">₹{unitPrice * qty}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span className="font-bold text-slate-900">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Restaurant Taxes (5%)</span>
              <span className="font-bold text-slate-900">₹{tax}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-extrabold bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                <span>Coupon Promo Discount</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-950">
              <span className="text-sm">Grand Total Amount</span>
              <span className="text-xl text-orange-600 font-black">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black py-4 rounded-2xl shadow-md hover:shadow-lg hover:brightness-105 transition-all text-xs flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Securing your order...' : `Confirm & Place Order (₹${totalAmount})`}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Address Label</label>
            <input
              type="text"
              required
              value={newAddr.title}
              onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
              placeholder="Home / Office / Other"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Flat / House / Street</label>
            <input
              type="text"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              placeholder="Apt 4B, Hill View Towers"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Area</label>
              <input
                type="text"
                required
                value={newAddr.area}
                onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                placeholder="Bandra West"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Pincode</label>
              <input
                type="text"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                placeholder="400050"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-700"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
}
