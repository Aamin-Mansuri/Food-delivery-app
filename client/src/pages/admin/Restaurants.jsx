import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  Phone,
  Power,
  ShieldCheck,
  RefreshCw,
  Plus,
  Sliders,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { adminService } from '../../services/adminService';
import Modal from '../../components/common/Modal';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'OPEN'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRest, setNewRest] = useState({
    name: '',
    cuisineTypes: 'North Indian, Mughlai, Biryani',
    address: 'Bandra West, Mumbai',
    phone: '+91 9820011223',
    priceForTwo: 500,
    deliveryTime: '25-35 min',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  });

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      setRestaurants(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleApprove = async (id) => {
    try {
      soundFX.playSuccess();
      await adminService.toggleApproveRestaurant(id);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOpen = async (id) => {
    try {
      soundFX.playPop();
      await restaurantService.toggleOpen(id);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      soundFX.playSuccess();
      await restaurantService.createRestaurant({
        ...newRest,
        cuisineTypes: newRest.cuisineTypes.split(',').map((s) => s.trim()),
      });
      setIsCreateOpen(false);
      setNewRest({
        name: '',
        cuisineTypes: 'North Indian, Biryani',
        address: 'Mumbai',
        phone: '+91 9820011223',
        priceForTwo: 500,
        deliveryTime: '25-35 min',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      });
      fetchRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.cuisineTypes || []).some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === 'PENDING') return matchesSearch && !r.isApproved;
    if (filterType === 'APPROVED') return matchesSearch && r.isApproved;
    if (filterType === 'OPEN') return matchesSearch && r.isOpen;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Partner Kitchens
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {restaurants.length} Registered Outlets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Restaurant & Kitchen Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Approve partner applications, toggle online store availability, and monitor kitchen ratings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Outlet</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              fetchRestaurants();
            }}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: `All (${restaurants.length})` },
              { id: 'PENDING', label: `Pending (${restaurants.filter((r) => !r.isApproved).length})` },
              { id: 'APPROVED', label: `Approved (${restaurants.filter((r) => r.isApproved).length})` },
              { id: 'OPEN', label: `Open Now (${restaurants.filter((r) => r.isOpen).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setFilterType(tab.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={r.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'}
                  alt={r.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm truncate">{r.name}</h3>
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{r.rating || '4.5'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {(r.cuisineTypes || []).join(', ') || 'Multi-cuisine'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{r.address || 'Mumbai'}</span>
                  </p>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggleOpen(r._id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                      r.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{r.isOpen ? 'OPEN' : 'CLOSED'}</span>
                  </button>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      r.isApproved
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {r.isApproved ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApprove(r._id)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    r.isApproved
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {r.isApproved ? 'Revoke' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard Restaurant Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Onboard Partner Kitchen">
        <form onSubmit={handleCreateRestaurant} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Restaurant Name</label>
            <input
              type="text"
              required
              value={newRest.name}
              onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
              placeholder="e.g. Royal Biryani & Kebabs"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Cuisines (Comma-separated)</label>
            <input
              type="text"
              required
              value={newRest.cuisineTypes}
              onChange={(e) => setNewRest({ ...newRest, cuisineTypes: e.target.value })}
              placeholder="North Indian, Biryani, Desserts"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Phone Number</label>
              <input
                type="text"
                required
                value={newRest.phone}
                onChange={(e) => setNewRest({ ...newRest, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Avg Price for Two (₹)</label>
              <input
                type="number"
                required
                value={newRest.priceForTwo}
                onChange={(e) => setNewRest({ ...newRest, priceForTwo: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Outlet Address</label>
            <input
              type="text"
              required
              value={newRest.address}
              onChange={(e) => setNewRest({ ...newRest, address: e.target.value })}
              placeholder="Shop No. 4, Bandra West, Mumbai"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Create & Verify Restaurant Outlet
          </button>
        </form>
      </Modal>
    </div>
  );
}
