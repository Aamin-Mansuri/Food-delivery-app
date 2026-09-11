import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Heart, ShieldCheck, Truck, Headphones, Award, Sparkles, ChefHat } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-slate-300 pt-16 pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Features Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800/80">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-display">20-30 Min Express</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Live thermal bag transit</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-display">100% Hygiene Verified</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">FSSAI 5-Star partners only</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-display">Artisanal Curation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Chef-crafted menus</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider font-display">Priority Support</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct kitchen contact</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-red-500 flex items-center justify-center text-white shadow-md">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white font-display">
                Food<span className="text-orange-500">Rush</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-normal">
              FoodRush is an artisanal food discovery & express delivery network. We connect culinary gourmets with hand-picked kitchens with live kitchen tracking and temperature-guaranteed packaging.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-mono">Taste Explore</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/restaurants" className="hover:text-amber-400 transition-colors">Artisanal Kitchens</Link></li>
              <li><Link to="/search" className="hover:text-amber-400 transition-colors">Popular Cuisines</Link></li>
              <li><Link to="/favorites" className="hover:text-amber-400 transition-colors">Saved Dishes</Link></li>
              <li><Link to="/orders" className="hover:text-amber-400 transition-colors">Live Order History</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-mono">Partner Ecosystem</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/signup?role=restaurant_owner" className="hover:text-amber-400 transition-colors">List Your Kitchen</Link></li>
              <li><Link to="/signup?role=delivery_partner" className="hover:text-amber-400 transition-colors">Join Delivery Fleet</Link></li>
              <li><Link to="/restaurant/dashboard" className="hover:text-amber-400 transition-colors">Chef & Kitchen Portal</Link></li>
              <li><Link to="/delivery/dashboard" className="hover:text-amber-400 transition-colors">Rider Live Radar</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4 font-mono">Service Hubs</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Mumbai (Bandra, Juhu, Powai)</li>
              <li>Bengaluru (Indiranagar, Koramangala)</li>
              <li>New Delhi (CP, South Ex)</li>
              <li>Pune (Koregaon Park)</li>
              <li>Hyderabad (Jubilee Hills)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FoodRush Artisanal Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-1.5 mt-4 sm:mt-0 font-medium">
            <span>Crafted for true food connoisseurs</span>
            <Heart className="w-3.5 h-3.5 text-orange-500 fill-current" />
          </div>
        </div>

      </div>
    </footer>
  );
}
