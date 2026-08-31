import React, { useEffect, useState } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  Power,
  RefreshCw,
  Navigation,
  Shield,
  Clock,
  UserCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnline, setFilterOnline] = useState('ALL'); // 'ALL' | 'ONLINE' | 'OFFLINE' | 'ACTIVE_TRIP'

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDeliveryPartners();
      setPartners(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleToggleOnline = async (partnerId, currentStatus) => {
    try {
      soundFX.playPop();
      await adminService.updateDeliveryPartner(partnerId, { isOnline: !currentStatus });
      fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async (partnerId) => {
    try {
      soundFX.playPop();
      await adminService.toggleBlockUser(partnerId);
      fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = partners.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterOnline === 'ONLINE') return matchesSearch && p.isOnline;
    if (filterOnline === 'OFFLINE') return matchesSearch && !p.isOnline;
    if (filterOnline === 'ACTIVE_TRIP') return matchesSearch && p.activeDelivery;
    return matchesSearch;
  });

  const totalOnline = partners.filter((p) => p.isOnline).length;
  const activeDeliveriesCount = partners.filter((p) => p.activeDelivery).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Logistics & Fleet
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {partners.length} Registered Riders
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Delivery Fleet Operations
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor active riders on duty, vehicle credentials, completed routes, and partner earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            fetchPartners();
          }}
          disabled={loading}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Fleet Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total Fleet</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{partners.length} Riders</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-500">Online & On Duty</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{totalOnline} Active</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-blue-500">On Active Route</span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">{activeDeliveriesCount} Delivering</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-purple-500">Fleet Rating</span>
          <p className="text-xl font-black text-purple-600 mt-1 font-mono">4.85 ★</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rider by name, phone, or vehicle number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: `All (${partners.length})` },
              { id: 'ONLINE', label: `Online (${totalOnline})` },
              { id: 'ACTIVE_TRIP', label: `On Route (${activeDeliveriesCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setFilterOnline(tab.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterOnline === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((partner) => (
            <div
              key={partner._id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={partner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={partner.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{partner.name}</h3>
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{partner.rating || '4.8'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{partner.phone}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {partner.vehicleType} • <span className="text-slate-700 font-bold">{partner.vehicleNumber}</span>
                  </p>
                </div>
              </div>

              {/* Active Trip Strip if any */}
              {partner.activeDelivery && (
                <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase font-mono">
                    <span>Active Route</span>
                    <span>Order #{partner.activeDelivery.orderId}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {partner.activeDelivery.restaurantDetails?.name} ➔ {partner.activeDelivery.deliveryAddress?.city || 'Customer'}
                  </p>
                </div>
              )}

              {/* Stats & Actions Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Completed</span>
                  <span className="font-mono font-black text-slate-800">{partner.totalDeliveries || 0} Trips</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggleOnline(partner._id, partner.isOnline)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      partner.isOnline
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {partner.isOnline ? 'Online' : 'Offline'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleBlock(partner._id)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      partner.isBlocked
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600'
                    }`}
                  >
                    {partner.isBlocked ? 'Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
