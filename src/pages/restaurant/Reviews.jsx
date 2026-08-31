import React, { useEffect, useState } from 'react';
import Rating from '../../components/common/Rating';
import API from '../../services/api';

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    API.get('/reviews/restaurant/demo_restaurant_id').then((res) => setReviews(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Customer Feedback & Reviews</h1>
        <p className="text-xs text-slate-500 font-medium">Ratings and comments left by dining customers</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-100">
            No customer reviews recorded yet.
          </p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{r.userId?.name || 'Customer'}</span>
                <Rating value={r.rating} />
              </div>
              <p className="text-xs text-slate-600">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
