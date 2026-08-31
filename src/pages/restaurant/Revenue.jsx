import React from 'react';
import StatCard from '../../components/dashboard/StatCard';
import { IndianRupee, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function RestaurantRevenue() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Revenue & Payout Analytics</h1>
        <p className="text-xs text-slate-500 font-medium">Financial breakdown, commissions, and weekly payouts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Gross Sales" value="₹1,24,500" change="22.4%" icon={IndianRupee} color="emerald" />
        <StatCard title="Platform Commission (15%)" value="₹18,675" icon={TrendingUp} color="orange" />
        <StatCard title="Net Bank Payout" value="₹1,05,825" icon={ArrowUpRight} color="blue" />
      </div>
    </div>
  );
}
