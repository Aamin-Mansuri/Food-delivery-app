import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Star, MessageSquare } from 'lucide-react';
import Rating from '../../components/common/Rating';
import { reviewService } from '../../services/reviewService';

export default function RestaurantReviews() {
  const { user } = useSelector((state) => state.auth);
  const { restaurants } = useSelector((state) => state.restaurant);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the restaurant owned by the logged-in user
    const myRestaurant = restaurants?.find(
      (r) => String(r.owner) === String(user?._id)
    );
    const restaurantId = myRestaurant?._id || 'rest_001';

    reviewService
      .getRestaurantReviews(restaurantId)
      .then((res) => setReviews(res.data?.data || res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [user, restaurants]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Customer Reviews</h1>
          <p className="text-xs text-slate-500 font-medium">Ratings and feedback from your customers</p>
        </div>
        {reviews.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 text-center">
            <p className="text-3xl font-black text-orange-600">{avgRating}</p>
            <p className="text-xs text-slate-500 mt-0.5">{reviews.length} reviews</p>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 p-6 bg-white rounded-2xl border border-slate-100">
          Loading reviews...
        </p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No reviews yet</p>
          <p className="text-xs text-slate-300 mt-1">Customer reviews will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {r.userId?.name || r.userName || 'Customer'}
                </span>
                <Rating value={r.rating} />
              </div>
              <p className="text-xs text-slate-600">{r.comment}</p>
              <p className="text-[10px] text-slate-400">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
