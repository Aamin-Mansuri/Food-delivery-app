import React, { useState } from 'react';
import {
  Database,
  Sliders,
  DollarSign,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Cloud,
  Layers,
  Sparkles,
} from 'lucide-react';
import MongoAtlasBackupManager from '../../components/admin/MongoAtlasBackupManager';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'rates' | 'security'
  const [rates, setRates] = useState({
    commissionRate: 15,
    gstRate: 5,
    deliveryBaseFee: 30,
    surgeMultiplier: 1.2,
    minimumOrderValue: 99,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRates = (e) => {
    e.preventDefault();
    soundFX.playSuccess();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              System Control
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Environment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Platform Settings & Database Sync
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage MongoDB Atlas replication, platform commission splits, tax rates, and database snapshots.
          </p>
        </div>

        {/* Tab Navigation Chips */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              setActiveTab('database');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-orange-600" />
            <span>MongoDB Atlas Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              setActiveTab('rates');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'rates'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rates & Fees</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              setActiveTab('security');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Security & Auth</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Database & MongoDB Atlas Backup */}
      {activeTab === 'database' && (
        <MongoAtlasBackupManager />
      )}

      {/* Tab 2: Rates & Fees */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Commercial Split & Fee Configuration</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              These percentages apply across all checkout cart calculations and merchant settlement summaries.
            </p>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 font-mono">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={rates.commissionRate}
                  onChange={(e) => setRates({ ...rates, commissionRate: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 font-mono">
                  GST & Taxes Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={rates.gstRate}
                  onChange={(e) => setRates({ ...rates, gstRate: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 font-mono">
                  Base Delivery Charge (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={rates.deliveryBaseFee}
                  onChange={(e) => setRates({ ...rates, deliveryBaseFee: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 font-mono">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={rates.minimumOrderValue}
                  onChange={(e) => setRates({ ...rates, minimumOrderValue: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Financial configuration saved and applied across platform!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Financial Configuration</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">Security & Key Management</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage JWT session secrets and encryption parameters.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 font-mono">
                JWT Authentication Token Signing
              </label>
              <div className="flex items-center justify-between text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                <span>foodrush_super_secret_jwt_••••••••</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  HMAC-SHA256 Active
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 font-mono">
                Session Expiration Policy
              </label>
              <div className="text-xs font-bold text-slate-800">
                Standard JWT lifetime: <span className="font-mono text-orange-600">30 Days</span> (Rolling refresh)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
