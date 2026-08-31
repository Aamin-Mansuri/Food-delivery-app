import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, Bike, Star, Phone, Mail, Award } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';

export default function DeliveryProfile() {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    deliveryService.getProfile().then((res) => setProfile(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Delivery Fleet Partner Profile</h1>
            <p className="text-xs text-slate-500 font-medium">Verified vehicle credentials, rider badge, and active status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Main Profile Info */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80'}
                  alt={user?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xs"
                />
                <div>
                  <h2 className="font-black text-slate-900 text-lg">{user?.name || 'Vikram Singh'}</h2>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1 border border-emerald-200 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED FLEET PARTNER</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-slate-800 text-sm flex items-center space-x-2 mt-0.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user?.email || 'delivery@foodrush.com'}</span>
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Mobile Number</p>
                  <p className="font-semibold text-slate-800 text-sm flex items-center space-x-2 mt-0.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{user?.phone || '+91 9711223344'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle & Credentials */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-2">
                <Bike className="w-5 h-5 text-orange-600" />
                <span>Vehicle & License Details</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Vehicle Type</p>
                  <p className="font-extrabold text-slate-900 text-base mt-0.5">{profile?.vehicleType || 'Motorcycle / Electric Scooter'}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Vehicle Registration Number</p>
                  <p className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-3 py-1.5 rounded-xl inline-block mt-1">
                    {profile?.vehicleNumber || 'MH-02-FR-1080'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Customer Rating</p>
                    <p className="font-black text-amber-500 text-lg flex items-center space-x-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{profile?.rating || 4.9} / 5.0</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Total Completed Trips</p>
                    <p className="font-black text-slate-900 text-lg flex items-center space-x-1 mt-0.5">
                      <Award className="w-4 h-4 text-orange-600" />
                      <span>{profile?.totalDeliveries || 48} Orders</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}

