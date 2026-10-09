import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CheckCircle2 } from 'lucide-react';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import { notificationService } from '../../services/notificationService';

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
    notificationService.markNotificationsRead();
  }, [dispatch]);

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
          <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 font-medium">Live status alerts and order updates</p>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}
