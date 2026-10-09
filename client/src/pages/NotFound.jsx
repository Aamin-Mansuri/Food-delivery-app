import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
        <UtensilsCrossed className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 max-w-md text-base text-slate-600">
        Oops! The page or dish you are looking for doesn't exist or might have been moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Home className="h-4 w-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
