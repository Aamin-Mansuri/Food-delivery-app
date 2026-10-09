import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../../services/authService';
import { updateUserLocal } from '../../redux/slices/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);

    const res = await authService.updateProfile(formData);
    dispatch(updateUserLocal(res.data?.data || res.data));
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
          <h1 className="text-3xl font-black text-slate-900">My Profile Settings</h1>
          <p className="text-xs text-slate-500 font-medium">Update account information and preferences</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full mt-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-orange-700 transition-colors shadow-xs"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Quick link to Order History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Past Orders & History</h3>
            <p className="text-xs text-slate-500 mt-0.5">View your order receipts, dishes ordered, and live delivery statuses</p>
          </div>
          <Link
            to="/orders"
            className="px-4 py-2.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            View Order History
          </Link>
        </div>
    </div>
  );
}
