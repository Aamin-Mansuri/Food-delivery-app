import React, { useEffect, useState } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import { IndianRupee, Truck, Calendar, Wallet } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';

export default function DeliveryEarnings() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    deliveryService.getProfile().then((res) => {
      setProfile(res.data?.data || res.data);
    });
  }, []);

  const todayEarnings = profile?.earningsToday || 1420;
  const totalEarnings = profile?.totalEarnings || 28400;
  const totalDeliveries = profile?.totalDeliveries || 48;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Partner Earnings & Payouts</h1>
            <p className="text-xs text-slate-500 font-medium">Daily trips, tips, incentives, and direct bank transfers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Today's Earnings" value={`₹${todayEarnings}`} change="18%" icon={IndianRupee} color="emerald" />
            <StatCard title="Total Cumulative Earnings" value={`₹${totalEarnings}`} icon={Wallet} color="purple" />
            <StatCard title="Total Trips Completed" value={`${totalDeliveries} trips`} icon={Truck} color="orange" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span>Recent Daily Payout Ledger</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Completed Trips</th>
                    <th className="py-3 px-2">Trip Incentives</th>
                    <th className="py-3 px-2">Payout Amount</th>
                    <th className="py-3 px-2">Bank Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="py-3.5 px-2 font-bold text-slate-900">Today (Live)</td>
                    <td className="py-3.5 px-2">12 orders</td>
                    <td className="py-3.5 px-2 text-emerald-600 font-bold">+₹150 Bonus</td>
                    <td className="py-3.5 px-2 font-extrabold text-slate-900">₹{todayEarnings}</td>
                    <td className="py-3.5 px-2"><span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-200">Processing</span></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-2 font-bold text-slate-900">Yesterday</td>
                    <td className="py-3.5 px-2">15 orders</td>
                    <td className="py-3.5 px-2 text-emerald-600 font-bold">+₹200 Bonus</td>
                    <td className="py-3.5 px-2 font-extrabold text-slate-900">₹1,850</td>
                    <td className="py-3.5 px-2"><span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">Transferred to HDFC</span></td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-2 font-bold text-slate-900">20 Aug 2026</td>
                    <td className="py-3.5 px-2">11 orders</td>
                    <td className="py-3.5 px-2 text-emerald-600 font-bold">+₹100 Bonus</td>
                    <td className="py-3.5 px-2 font-extrabold text-slate-900">₹1,320</td>
                    <td className="py-3.5 px-2"><span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">Transferred to HDFC</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}

