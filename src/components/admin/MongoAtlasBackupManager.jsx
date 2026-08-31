import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Server,
  Zap,
  HardDrive,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Ticket,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
  Copy,
  Sliders,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function MongoAtlasBackupManager({ onBackupCompleted }) {
  const [status, setStatus] = useState({
    connected: false,
    connecting: false,
    isAtlas: false,
    host: 'Disconnected',
    dbName: 'foodrush',
    pingLatency: 'N/A',
    lastBackupAt: null,
    lastBackupStatus: 'None',
    lastBackupStats: null,
    autoSyncEnabled: true,
    configuredUri: '',
    collectionStats: {
      users: 0,
      foods: 0,
      restaurants: 0,
      orders: 0,
      categories: 0,
      coupons: 0,
    },
    memoryStats: {
      users: 0,
      foods: 0,
      restaurants: 0,
      orders: 0,
      categories: 0,
      coupons: 0,
    },
    backupHistory: [],
  });

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [showUriInput, setShowUriInput] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'info', text: string }
  const [copiedUri, setCopiedUri] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBackupStatus();
      if (res?.data?.data) {
        setStatus(res.data.data);
      }
    } catch (err) {
      console.warn('Backup status fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSyncToAtlas = async () => {
    try {
      setSyncing(true);
      soundFX.playPop();
      setFeedback({ type: 'info', text: 'Connecting & synchronizing all collections to MongoDB Atlas...' });

      const res = await adminService.syncToMongoAtlas({
        uri: customUri || undefined,
      });

      soundFX.playSuccess();
      setFeedback({
        type: 'success',
        text: res.data?.message || 'All collections (Food, Users, Outlets, Orders) backed up to MongoDB Atlas successfully!',
      });
      await fetchStatus();
      if (onBackupCompleted) onBackupCompleted();
    } catch (err) {
      soundFX.playNotification();
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'MongoDB Atlas backup failed. Check connection string.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    if (!customUri.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a valid MongoDB Atlas connection URI string.' });
      return;
    }

    try {
      setTestingConnection(true);
      setFeedback({ type: 'info', text: 'Pinging MongoDB Atlas cluster...' });
      const res = await adminService.testMongoAtlasConnection(customUri.trim());

      soundFX.playSuccess();
      setFeedback({
        type: 'success',
        text: `Cluster Ping Verified! Host: ${res.data?.data?.host || 'MongoDB Atlas'} (${res.data?.data?.latency || '40ms'}).`,
      });
    } catch (err) {
      soundFX.playNotification();
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Connection test failed.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnectUri = async () => {
    if (!customUri.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a valid MongoDB Atlas connection URI string.' });
      return;
    }

    try {
      setLoading(true);
      soundFX.playPop();
      const res = await adminService.connectMongoAtlasUri(customUri.trim());
      soundFX.playSuccess();
      setFeedback({
        type: 'success',
        text: 'Connected and synchronized primary database to MongoDB Atlas successfully!',
      });
      setShowUriInput(false);
      setCustomUri('');
      await fetchStatus();
    } catch (err) {
      soundFX.playNotification();
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Could not connect to MongoDB Atlas cluster.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      soundFX.playSuccess();
      const res = await adminService.exportBackupSnapshot();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `foodrush_atlas_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setFeedback({
        type: 'success',
        text: 'JSON snapshot archive downloaded with complete data schema.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Export failed: ' + (err.message || 'Server error'),
      });
    }
  };

  const handleRestoreJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setRestoring(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const res = await adminService.restoreBackupSnapshot(parsed, true);
          soundFX.playSuccess();
          setFeedback({
            type: 'success',
            text: res.data?.message || 'Data restored and backed up into MongoDB Atlas successfully!',
          });
          await fetchStatus();
          if (onBackupCompleted) onBackupCompleted();
        } catch (innerErr) {
          setFeedback({ type: 'error', text: 'Invalid JSON backup file or restore failed: ' + innerErr.message });
        } finally {
          setRestoring(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setRestoring(false);
      setFeedback({ type: 'error', text: 'Could not read backup file.' });
    }
  };

  const handleToggleAutoSync = async () => {
    try {
      const nextState = !status.autoSyncEnabled;
      const res = await adminService.toggleAtlasAutoSync(nextState);
      setStatus((prev) => ({ ...prev, autoSyncEnabled: nextState }));
      soundFX.playPop();
      setFeedback({
        type: 'info',
        text: res.data?.message || `Real-time auto-backup to MongoDB Atlas is now ${nextState ? 'ENABLED' : 'DISABLED'}.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const copyTemplateUri = () => {
    navigator.clipboard.writeText('mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodrush?retryWrites=true&w=majority');
    setCopiedUri(true);
    soundFX.playPop();
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const collections = [
    { name: 'Dishes & Foods', key: 'foods', count: status.collectionStats?.foods || status.memoryStats?.foods || 0, icon: UtensilsCrossed, color: 'text-orange-500 bg-orange-50 border-orange-200' },
    { name: 'Users & Accounts', key: 'users', count: status.collectionStats?.users || status.memoryStats?.users || 0, icon: Users, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { name: 'Kitchen Outlets', key: 'restaurants', count: status.collectionStats?.restaurants || status.memoryStats?.restaurants || 0, icon: HardDrive, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { name: 'Orders & Tickets', key: 'orders', count: status.collectionStats?.orders || status.memoryStats?.orders || 0, icon: ShoppingBag, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { name: 'Coupons & Promos', key: 'coupons', count: status.collectionStats?.coupons || status.memoryStats?.coupons || 0, icon: Ticket, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Main Header Card with Live Status */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <span className="flex items-center space-x-1.5 bg-orange-600/90 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs">
                <Database className="w-3.5 h-3.5" />
                <span>MongoDB Atlas Backup Engine</span>
              </span>

              {status.connected ? (
                <span className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cluster Connected ({status.pingLatency || 'Active'})</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Ready for Atlas Sync</span>
                </span>
              )}

              <span className="text-[11px] font-medium text-slate-400 font-mono">
                DB: <strong className="text-white">{status.dbName}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Cloud Database Backup & Atlas Replication
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Safeguard all restaurant menus, customer accounts, orders, ratings, and coupons with real-time replication directly to your MongoDB Atlas cluster.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSyncToAtlas}
              disabled={syncing || loading}
              className="px-5 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Cloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'Backing Up to Atlas...' : 'Backup All Data to MongoDB Atlas'}</span>
            </button>

            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Refresh Cluster Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert Strip */}
        {feedback && (
          <div
            className={`mt-5 p-3.5 rounded-2xl text-xs font-bold flex items-start justify-between gap-2 border animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-900/50 border-emerald-500/40 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-900/50 border-rose-500/40 text-rose-200'
                : 'bg-blue-900/50 border-blue-500/40 text-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-[10px] text-slate-400 hover:text-white uppercase font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. Collection Snapshot Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {collections.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Atlas Ready
                </span>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">{c.count}</span>
                <p className="text-xs font-bold text-slate-600 truncate mt-0.5">{c.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MongoDB Atlas Configuration & Connection Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Server className="w-4 h-4 text-orange-600" />
              <span>MongoDB Atlas Cluster Connection</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Connect your production or sandbox MongoDB Atlas cluster URI to enable automated background persistence.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowUriInput(!showUriInput)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showUriInput ? 'Hide URI Input' : 'Configure Atlas URI'}</span>
            </button>
          </div>
        </div>

        {/* Current Active URI & State Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Active Host Endpoint
            </span>
            <div className="font-mono text-xs font-extrabold text-slate-800 break-all flex items-center justify-between gap-2">
              <span className="truncate">{status.host || 'MongoDB Cluster (Auto-managed)'}</span>
              <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md text-emerald-600 font-bold shrink-0">
                {status.connected ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Last Completed Backup
            </span>
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>{status.lastBackupAt ? new Date(status.lastBackupAt).toLocaleString() : 'Ready for first sync'}</span>
              {status.lastBackupStats && (
                <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                  {status.lastBackupStats.totalDocuments} Docs ({status.lastBackupStats.duration})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Optional Custom URI Input Form */}
        {showUriInput && (
          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-orange-950">
                MongoDB Atlas Connection String (SRV URI)
              </label>
              <button
                type="button"
                onClick={copyTemplateUri}
                className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center space-x-1 cursor-pointer"
              >
                {copiedUri ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUri ? 'Copied Template!' : 'Copy URI Template'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster0.mongodb.net/foodrush?retryWrites=true&w=majority"
                className="w-full px-3.5 py-2.5 bg-white border border-orange-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Note: In MongoDB Atlas Security settings, ensure <strong>Network Access</strong> allows IP <code className="bg-white px-1 py-0.5 rounded border">0.0.0.0/0</code> (or current cluster IP) and your database user has <code className="bg-white px-1 py-0.5 rounded border">readWriteAnyDatabase</code> role.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || !customUri.trim()}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{testingConnection ? 'Testing Ping...' : 'Test Atlas Ping'}</span>
              </button>

              <button
                type="button"
                onClick={handleConnectUri}
                disabled={loading || !customUri.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Set as Active Database</span>
              </button>
            </div>
          </div>
        )}

        {/* Auto-Sync Toggle Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${status.autoSyncEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Real-Time Mutation Auto-Backup</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Automatically push every newly created food item, user registration, and placed order to MongoDB Atlas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAutoSync}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 ${
              status.autoSyncEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {status.autoSyncEnabled ? 'Auto-Sync Active' : 'Auto-Sync Paused'}
          </button>
        </div>
      </div>

      {/* 4. JSON Snapshot Export & Restore Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export JSON Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">Download Local JSON Snapshot</h3>
            <p className="text-xs text-slate-500 font-medium">
              Export all {collections.reduce((a, b) => a + b.count, 0)} documents across 6 collections into a clean portable JSON snapshot file for offsite archiving.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full py-3 bg-slate-900 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export & Download Snapshot (.json)</span>
          </button>
        </div>

        {/* Restore from JSON Snapshot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900">Restore Snapshot into Atlas</h3>
            <p className="text-xs text-slate-500 font-medium">
              Upload a previously exported JSON backup file to restore foods, users, and order tickets directly into your database.
            </p>
          </div>

          <label className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-orange-400 text-slate-700 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer text-center">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>{restoring ? 'Restoring & Replicating...' : 'Select JSON Backup to Restore'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJSON}
              disabled={restoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Backup History & Audit Trail */}
      {status.backupHistory?.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Recent Backup & Sync Log</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {status.backupHistory.length} Recorded Backups
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {status.backupHistory.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs min-w-[500px]">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">{h.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right font-mono">
                  <span className="font-bold text-slate-700">{h.totalDocuments} Docs</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{h.duration}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold uppercase">
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
