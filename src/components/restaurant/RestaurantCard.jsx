import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, Star, MapPin, Sparkles, Tag, Bike } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { favoriteService } from '../../services/favoriteService';
import { fetchFavorites } from '../../redux/slices/favoriteSlice';
import { soundFX } from '../../utils/audioFeedback';

export default function RestaurantCard({ restaurant }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { restaurants: favoriteRestaurants } = useSelector((state) => state.favorite);

  const isFav = favoriteRestaurants.some((r) => r._id === restaurant._id);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    soundFX.playPop();
    await favoriteService.toggleFavoriteRestaurant(restaurant._id);
    dispatch(fetchFavorites());
  };

  const cuisines = restaurant.cuisineTypes || ['Multi-Cuisine', 'Fast Food'];
  const isFreeDelivery = restaurant.deliveryFee === 0 || restaurant.deliveryFee === undefined;

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-orange-300 transition-all duration-300 flex flex-col hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
        <img
          src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label="Save to favorites"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xs ${
            isFav
              ? 'bg-white text-rose-500 shadow-md'
              : 'bg-black/30 text-white hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Offer Tag */}
        {restaurant.discountPercentage && (
          <div className="absolute top-3 left-3 bg-orange-600/95 backdrop-blur-xs text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>{restaurant.discountPercentage}% OFF</span>
          </div>
        )}

        {/* Bottom Metrics Pill Bar on Cover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="bg-white/95 backdrop-blur-xs text-slate-900 font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>{restaurant.deliveryTime || '25-30 min'}</span>
          </div>

          <div className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs flex items-center space-x-1">
            <span>{restaurant.rating || '4.8'}</span>
            <Star className="w-3 h-3 fill-current text-white" />
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-orange-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
            {cuisines.join(' • ')}
          </p>

          <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center space-x-1 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{restaurant.address?.area || 'Bandra West'}, {restaurant.address?.city || 'Mumbai'}</span>
          </p>
        </div>

        {/* Footer Meta Strip */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold text-[11px]">
            ₹{restaurant.minimumOrder ? `${restaurant.minimumOrder} for two` : '250 for two'}
          </span>
          
          <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1 ${
            isFreeDelivery 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' 
              : 'text-orange-700 bg-orange-50 border border-orange-200/60'
          }`}>
            <Bike className="w-3 h-3" />
            <span>{isFreeDelivery ? 'Free Delivery' : `₹${restaurant.deliveryFee} Transit`}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
