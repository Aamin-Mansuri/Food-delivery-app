import React from 'react';

export default function StatCard({ title, value, change, icon: Icon, color = 'orange' }) {
  const colorMap = {
    orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        {change && (
          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
            <span>↑ {change}</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color] || colorMap.orange}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
}
