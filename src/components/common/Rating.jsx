import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ value = 4.5, count, size = 'sm' }) {
  const sizeClasses = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md space-x-0.5">
        <span>{Number(value).toFixed(1)}</span>
        <Star className={`${sizeClasses} fill-current text-white`} />
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 font-medium">({count})</span>
      )}
    </div>
  );
}
