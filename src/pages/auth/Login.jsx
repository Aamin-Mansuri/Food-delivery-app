import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Flame, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';
import { loginUser } from '../../redux/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');

  const redirectByRole = (userRole, fallbackUrl) => {
    if (fallbackUrl && fallbackUrl !== '/login' && fallbackUrl !== '/signup') {
      navigate(fallbackUrl);
      return;
    }
    switch (userRole) {
      case 'restaurant_owner':
        navigate('/restaurant/dashboard');
        break;
      case 'delivery_partner':
        navigate('/delivery/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'customer':
      default:
        navigate('/');
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then((res) => {
      if (!res.error && res.payload) {
        const userRole = res.payload?.user?.role || res.payload?.role || 'customer';
        redirectByRole(userRole, location.state?.from?.pathname);
      }
    });
  };

  const handleQuickLogin = (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword('password123');
    if (role) setSelectedRole(role);

    dispatch(loginUser({ email: demoEmail, password: 'password123' })).then((res) => {
      if (!res.error && res.payload) {
        const userRole = res.payload?.user?.role || role || 'customer';
        redirectByRole(userRole, location.state?.from?.pathname);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900 font-display">
            Food<span className="text-orange-600">Rush</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-semibold text-orange-600 hover:underline">
            create a new FoodRush account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
              <div className="mt-1.5 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-orange-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Evaluator Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>1-Click Role-Based Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@foodrush.com', 'customer')}
                className="p-2.5 text-left bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Customer</p>
                  <span className="text-[10px] bg-orange-200/60 text-orange-800 font-bold px-1.5 py-0.5 rounded">Store</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">customer@foodrush.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner@foodrush.com', 'restaurant_owner')}
                className="p-2.5 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Restaurant</p>
                  <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-1.5 py-0.5 rounded">Owner</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">owner@foodrush.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('delivery@foodrush.com', 'delivery_partner')}
                className="p-2.5 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Delivery</p>
                  <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-1.5 py-0.5 rounded">Rider</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">delivery@foodrush.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@foodrush.com', 'admin')}
                className="p-2.5 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Super Admin</p>
                  <span className="text-[10px] bg-purple-200/60 text-purple-900 font-bold px-1.5 py-0.5 rounded">Admin</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">admin@foodrush.com</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

