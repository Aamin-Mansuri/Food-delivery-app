import React from 'react';
import { Flame } from 'lucide-react';

export default function Loader({ fullScreen = false, label = 'Loading FoodRush...' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg animate-bounce">
          <Flame className="w-10 h-10 fill-current" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 animate-spin">
        <Flame className="w-6 h-6" />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
