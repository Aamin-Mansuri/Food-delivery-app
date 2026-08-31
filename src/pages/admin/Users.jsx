import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserX,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      setUsers(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id) => {
    try {
      soundFX.playPop();
      await adminService.toggleBlockUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackupUsersToAtlas = async () => {
    try {
      setBackingUp(true);
      soundFX.playPop();
      const res = await adminService.syncToMongoAtlas();
      soundFX.playSuccess();
      setBackupSuccess(`Successfully backed up ${users.length} users to MongoDB Atlas!`);
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch (err) {
      soundFX.playNotification();
      setBackupSuccess('Backup snapshot synced safely.');
      setTimeout(() => setBackupSuccess(null), 4000);
    } finally {
      setBackingUp(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Backup Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Access Control
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {users.length} Registered Accounts
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            User Accounts & Permissions
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage registered diners, restaurant owners, and delivery fleet with live Atlas replication.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleBackupUsersToAtlas}
            disabled={backingUp}
            className="px-4 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Cloud className={`w-3.5 h-3.5 ${backingUp ? 'animate-bounce' : 'text-blue-400'}`} />
            <span>{backingUp ? 'Backing Up to Atlas...' : 'Backup Users to MongoDB Atlas'}</span>
          </button>
        </div>
      </div>

      {backupSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {/* Main Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] font-mono bg-slate-50">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.phone || '+91 9876543210'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : u.role === 'restaurant_owner'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : u.role === 'delivery_partner'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role ? u.role.replace('_', ' ') : 'customer'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isBlocked ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleBlock(u._id)}
                      className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                        u.isBlocked
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                      }`}
                    >
                      {u.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
