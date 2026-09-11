import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { couponService } from '../../services/couponService';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 20,
    maxDiscountAmount: 100,
    minimumOrder: 199,
    description: 'Flat 20% OFF on gourmet meals',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getCoupons();
      setCoupons(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      soundFX.playSuccess();
      await couponService.createCoupon(newCoupon);
      setIsModalOpen(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountAmount: 20,
        maxDiscountAmount: 100,
        minimumOrder: 199,
        description: 'Flat 20% OFF on gourmet meals',
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      });
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      soundFX.playPop();
      await adminService.deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      soundFX.playPop();
      await adminService.toggleCoupon(id);
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    soundFX.playPop();
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Growth & Discounts
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {coupons.length} Promo Campaigns
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Coupons & Marketing Campaigns
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Deploy promotional discount vouchers, minimum spend requirements, and customer incentives.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              loadCoupons();
            }}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => copyCode(c.code)}
                      className="font-mono font-black text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Click to copy code"
                    >
                      <span>{c.code}</span>
                      {copiedCode === c.code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    c.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.isActive !== false ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mt-3">{c.description || 'Special Discount'}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Benefit</span>
                  <span className="font-bold text-orange-600">
                    {c.discountType === 'percentage' ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} FLAT`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Min Order</span>
                  <span className="font-bold text-slate-800">₹{c.minimumOrder || 0}</span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => handleToggle(c._id)}
                className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  c.isActive !== false
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                }`}
              >
                {c.isActive !== false ? 'Pause Code' : 'Activate Code'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(c._id)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Promo Voucher">
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Promo Code</label>
            <input
              type="text"
              required
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              placeholder="e.g. WELCOME50, FOODFEST"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Campaign Description</label>
            <input
              type="text"
              required
              value={newCoupon.description}
              onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              placeholder="Flat 50% OFF up to ₹150 on first order"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Discount Type</label>
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Discount Value</label>
              <input
                type="number"
                required
                min="1"
                value={newCoupon.discountAmount}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Min Order (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={newCoupon.minimumOrder}
                onChange={(e) => setNewCoupon({ ...newCoupon, minimumOrder: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Max Discount Cap (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={newCoupon.maxDiscountAmount}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Publish Promotional Voucher
          </button>
        </form>
      </Modal>
    </div>
  );
}
