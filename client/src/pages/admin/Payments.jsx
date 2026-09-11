import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Layers,
  Wallet,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'UPI' | 'CARD' | 'COD' | 'WALLET'

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders();
      setOrders(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalVolume = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const upiVolume = orders
    .filter((o) => (o.paymentMethod || 'UPI').toUpperCase() === 'UPI')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const cardVolume = orders
    .filter((o) => (o.paymentMethod || '').toUpperCase() === 'CARD')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const codVolume = orders
    .filter((o) => (o.paymentMethod || '').toUpperCase() === 'COD')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filtered = orders.filter((o) => {
    const method = (o.paymentMethod || 'UPI').toUpperCase();
    const matchesSearch =
      (o.orderId && o.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.restaurantDetails?.name && o.restaurantDetails.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (paymentFilter !== 'ALL' && method !== paymentFilter) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Treasury & Settlements
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              Auto-Settlement Daily
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Payment Gateways & Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time merchant payouts, customer UPI/Card transactions, and escrow splits.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              fetchTransactions();
            }}
            disabled={loading}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total Processed</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">₹{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-500">UPI Instant</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">₹{upiVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-blue-500">Cards & NetBanking</span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">₹{cardVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-amber-500">Cash on Delivery</span>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">₹{codVolume.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter & Transactions Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by transaction ID, customer or merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'UPI', 'CARD', 'COD'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setPaymentFilter(method);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  paymentFilter === method
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-extrabold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Txn Reference</th>
                <th className="px-4 py-3">Payer Customer</th>
                <th className="px-4 py-3">Recipient Kitchen</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Escrow Status</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono">
                    <span className="font-bold text-slate-900 block">TXN_{order._id?.slice(-8).toUpperCase()}</span>
                    <span className="text-[10px] text-slate-400">Order #{order.orderId || order._id?.slice(-6)}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">
                      {order.customerDetails?.name || order.deliveryAddress?.fullName || 'Customer'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {order.customerDetails?.phone || '+91 9876543210'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-extrabold text-slate-900 block truncate max-w-[160px]">
                      {order.restaurantDetails?.name || 'Partner Outlet'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      {order.paymentMethod || 'UPI'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-black text-slate-900 font-mono text-sm">
                    ₹{order.totalAmount || 0}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.paymentStatus || 'SETTLED'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
