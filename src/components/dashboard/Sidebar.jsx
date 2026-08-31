import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Users,
  Star,
  IndianRupee,
  BarChart3,
  Settings,
  User,
  Truck,
  Ticket,
  CreditCard,
  Flame,
  Home,
  Navigation,
  X,
} from 'lucide-react';

export default function Sidebar({ role = 'restaurant_owner', onCloseMobile }) {
  const linksMap = {
    restaurant_owner: [
      { to: '/restaurant/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/restaurant/orders', label: 'Incoming Orders', icon: ShoppingBag },
      { to: '/restaurant/menu', label: 'Menu Management', icon: UtensilsCrossed },
      { to: '/restaurant/categories', label: 'Food Categories', icon: FolderTree },
      { to: '/restaurant/reviews', label: 'Customer Reviews', icon: Star },
      { to: '/restaurant/revenue', label: 'Revenue & Sales', icon: IndianRupee },
      { to: '/restaurant/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/restaurant/settings', label: 'Settings', icon: Settings },
    ],
    delivery_partner: [
      { to: '/delivery/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/delivery/route', label: 'Assigned Route', icon: Navigation },
      { to: '/delivery/available-orders', label: 'Available Orders', icon: ShoppingBag },
      { to: '/delivery/history', label: 'Delivery History', icon: Truck },
      { to: '/delivery/earnings', label: 'Earnings', icon: IndianRupee },
      { to: '/delivery/profile', label: 'Partner Profile', icon: User },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
      { to: '/admin/foods', label: 'Food Items & Catalog', icon: UtensilsCrossed },
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/restaurants', label: 'Restaurants', icon: FolderTree },
      { to: '/admin/delivery-partners', label: 'Delivery Fleet', icon: Truck },
      { to: '/admin/orders', label: 'All Platform Orders', icon: ShoppingBag },
      { to: '/admin/coupons', label: 'Coupons & Offers', icon: Ticket },
      { to: '/admin/payments', label: 'Payments & Ledger', icon: CreditCard },
      { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
      { to: '/admin/settings', label: 'System & Atlas Backup', icon: Settings },
    ],
  };

  const navLinks = linksMap[role] || linksMap.restaurant_owner;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-full min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-black text-white font-display">
              Food<span className="text-orange-500">Rush</span>
            </span>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {role.replace('_', ' ')} Portal
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {/* Back to Customer Website Link */}
        <Link
          to="/"
          onClick={() => onCloseMobile?.()}
          className="flex items-center space-x-3 px-4 py-3 mb-4 rounded-xl text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-600 hover:text-white transition-all shadow-xs"
        >
          <Home className="w-4 h-4 text-orange-500 shrink-0 group-hover:text-white" />
          <span>← Back to Main Website</span>
        </Link>

        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => onCloseMobile?.()}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        FoodRush Management Console v2.0
      </div>
    </aside>
  );
}
