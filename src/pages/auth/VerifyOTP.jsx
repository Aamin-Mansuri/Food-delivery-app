import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyOTP() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Account Verified</h2>
        <p className="mt-2 text-sm text-slate-600">
          OTP verification is bypassed. Redirecting you to the home page...
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-orange-700 transition-colors"
          >
            <span>Continue Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
