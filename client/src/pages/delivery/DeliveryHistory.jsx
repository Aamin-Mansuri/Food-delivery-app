import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, MapPin } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryService
      .getMyOrders()
      .then((res) => {
        setDeliveries(res.data?.data || res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Delivery History</h1>
            <p className="text-xs text-slate-500 font-medium">Log of past completed order drop-offs and payouts</p>
          </div>

          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
                <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No History Records Yet</p>
                <p className="text-xs text-slate-400">Accepted and delivered orders will be logged here with fee breakdowns.</p>
              </div>
            ) : (
              deliveries.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-slate-900 text-sm">Order #{order.orderId}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      From: <span className="text-slate-800 font-bold">{order.restaurantDetails?.name || 'Restaurant'}</span>
                    </p>

                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Drop: {order.deliveryAddress?.house ? `${order.deliveryAddress.house}, ` : ''}{order.deliveryAddress?.area || 'Bandra West'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-1">
                    <span className="text-xs text-slate-400 block font-medium">Rider Earnings</span>
                    <span className="text-lg font-black text-emerald-600">₹{order.deliveryFee || 60}</span>
                    <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Credited</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
    </div>
  );
}

