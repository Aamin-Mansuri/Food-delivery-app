import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, Store, Truck, ShieldAlert, Home, Menu } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

export default function DashboardHeader({ title, role = 'restaurant_owner', onToggleMobileSidebar }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const roleLabels = {
    restaurant_owner: { label: 'Restaurant Owner Portal', icon: Store, bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    delivery_partner: { label: 'Delivery Partner Portal', icon: Truck, bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    admin: { label: 'Platform Admin Console', icon: ShieldAlert, bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  };

  const roleInfo = roleLabels[role] || roleLabels.restaurant_owner;
  const RoleIcon = roleInfo.icon;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left Title, Mobile Menu & Back button */}
      <div className="flex items-center space-x-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl border border-slate-200 transition-colors"
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all group"
          title="Go back to FoodRush Customer Main Website"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Main Website</span>
        </Link>

        {title && (
          <div className="hidden sm:block border-l border-slate-200 pl-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">{title}</h2>
          </div>
        )}
      </div>

      {/* Right User & Portal Info */}
      <div className="flex items-center space-x-3">
        <div className={`hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${roleInfo.bg}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{roleInfo.label}</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 pl-2 rounded-2xl border border-slate-200/60">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
            alt={user?.name || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-white shrink-0"
          />
          <div className="text-left pr-1 hidden sm:block">
            <p className="text-xs font-bold text-slate-900 line-clamp-1">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ') || role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
