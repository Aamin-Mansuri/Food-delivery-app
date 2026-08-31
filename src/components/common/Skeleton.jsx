import React from 'react';

export default function Skeleton({ type = 'card', count = 4 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse">
            <div className="w-full h-44 bg-slate-200 rounded-xl mb-4" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl w-full" />
      ))}
    </div>
  );
}
