import React from 'react';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

export default function RestaurantAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Analytics & Insights</h1>
        <p className="text-xs text-slate-500 font-medium">Order volumes, peak dining hours, and customer retention</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Peak Ordering Hours</h3>
        <p className="text-xs text-slate-500">Highest order frequency recorded between 7:30 PM - 10:00 PM</p>
      </div>
    </div>
  );
}
