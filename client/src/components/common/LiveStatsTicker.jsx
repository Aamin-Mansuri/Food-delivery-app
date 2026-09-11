import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ShieldCheck, Star, Users, Flame, Truck } from 'lucide-react';

export default function LiveStatsTicker() {
  const [activeOrdersCount, setActiveOrdersCount] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrdersCount((prev) => Math.floor(40 + Math.random() * 25));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {/* Metric 1 */}
        <div className="space-y-1 border-r border-slate-800/80 last:border-none pr-4">
          <div className="flex items-center justify-center space-x-1 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg. Delivery Time</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-white">22 Mins</p>
          <p className="text-[11px] text-slate-400">Direct courier transit</p>
        </div>

        {/* Metric 2 */}
        <div className="space-y-1 border-r border-slate-800/80 last:border-none pr-4">
          <div className="flex items-center justify-center space-x-1 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Artisanal Kitchens</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-white">120+ Verified</p>
          <p className="text-[11px] text-slate-400">5-Star hygiene certified</p>
        </div>

        {/* Metric 3 */}
        <div className="space-y-1 border-r border-slate-800/80 last:border-none pr-4">
          <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Live Foodies Ordering</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {activeOrdersCount} in area
          </p>
          <p className="text-[11px] text-slate-400">Piping hot dispatch</p>
        </div>

        {/* Metric 4 */}
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-1 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Customer Rating</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-white">4.92 / 5.0</p>
          <p className="text-[11px] text-slate-400">Based on 28k+ reviews</p>
        </div>
      </div>
    </div>
  );
}
