import React, { useState } from 'react';

export default function RestaurantSettings() {
  const [isOpen, setIsOpen] = useState(true);
  const [minOrder, setMinOrder] = useState(150);
  const [deliveryFee, setDeliveryFee] = useState(30);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Outlet Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Manage store operating status, delivery fees, and minimum thresholds</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs max-w-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Store Accepting Orders</h4>
            <p className="text-xs text-slate-400">Toggle whether kitchen is currently open on FoodRush app</p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isOpen ? 'OPEN' : 'CLOSED'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Minimum Order Amount (₹)</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Delivery Fee Charge (₹)</label>
            <input
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <button
            onClick={() => alert('Settings updated!')}
            className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
