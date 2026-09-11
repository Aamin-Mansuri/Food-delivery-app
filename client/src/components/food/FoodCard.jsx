import React, { useState } from 'react';
import { Plus, Minus, Heart, Star, SlidersHorizontal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../../redux/slices/cartSlice';
import { favoriteService } from '../../services/favoriteService';
import { fetchFavorites } from '../../redux/slices/favoriteSlice';
import { soundFX } from '../../utils/audioFeedback';
import DishCustomizerModal from './DishCustomizerModal';

export default function FoodCard({ food, restaurant, variant = 'standard' }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { foods: favoriteFoods } = useSelector((state) => state.favorite);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const foodId = String(food?._id || food?.id);
  const cartItem = items.find((i) => String(i.food?._id || i.food?.id || i.food) === foodId);
  const isFav = favoriteFoods.some((f) => String(f._id || f.id) === foodId);
  const isSoldOut = food?.isAvailable === false;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !food) return;
    soundFX.playPop();
    await favoriteService.toggleFavoriteFood(food._id || food.id);
    dispatch(fetchFavorites());
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut) return;
    soundFX.playSuccess();
    dispatch(addToCart({ food, restaurant }));
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (!cartItem) return;
    soundFX.playPop();
    dispatch(updateQuantity({ foodId, quantity: cartItem.quantity + 1 }));
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (!cartItem) return;
    soundFX.playPop();
    dispatch(updateQuantity({ foodId, quantity: cartItem.quantity - 1 }));
  };

  const displayPrice = food.discountPrice > 0 ? food.discountPrice : food.price;
  const originalPrice = food.discountPrice > 0 ? food.price : null;

  return (
    <>
      <div
        onClick={() => setIsCustomizerOpen(true)}
        className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 p-4 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between"
      >
        {/* Main Content Area */}
        <div className="flex items-start justify-between gap-4">
          
          {/* Details (Left) */}
          <div className="flex-1 space-y-1.5 pr-1">
            
            {/* Dietary Badge & Bestseller */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center p-0.5 shrink-0 ${
                  food.isVegetarian ? 'border-emerald-600 bg-emerald-50' : 'border-rose-600 bg-rose-50'
                }`}
                title={food.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${food.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`}
                />
              </span>

              {food.isBestSeller && (
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  ★ Bestseller
                </span>
              )}

              {food.rating && (
                <div className="flex items-center text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                  <span>{food.rating}</span>
                </div>
              )}
            </div>

            {/* Food Name */}
            <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
              {food.name}
            </h4>

            {/* Pricing Details */}
            <div className="flex items-baseline gap-2">
              <span className="font-black text-slate-900 text-base">₹{displayPrice}</span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
              )}
              {originalPrice && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                  ₹{originalPrice - displayPrice} off
                </span>
              )}
            </div>

            {/* Dish Description */}
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal pt-0.5">
              {food.description}
            </p>
          </div>

          {/* Dish Image & Action Controls (Right) */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-2xs">
            <img
              src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
              alt={food.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Bookmark Favorite */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              title="Save to favorites"
              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-xs ${
                isFav ? 'bg-white text-rose-500 shadow-md' : 'bg-black/30 text-white hover:bg-white hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Add / Quantity Stepper Overlay at the bottom of thumbnail */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[88%]">
              {isSoldOut ? (
                <span className="block text-center bg-slate-900/90 text-white text-[10px] font-bold py-1 rounded-lg">
                  Sold Out
                </span>
              ) : cartItem ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between bg-slate-900 text-white rounded-xl px-2 py-1 shadow-md text-xs font-bold"
                >
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="p-0.5 hover:text-orange-400 cursor-pointer transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white text-xs px-1 font-bold font-mono">{cartItem.quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="p-0.5 hover:text-orange-400 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full bg-white hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-500 font-extrabold text-xs py-1 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>ADD</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer Meta Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>{food.isSpicy ? '🌶️ Spicy' : 'Mild'}</span>
            <span>•</span>
            <span>15-20 min prep</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCustomizerOpen(true);
            }}
            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Interactive Customizer & Spotlight Modal */}
      {isCustomizerOpen && (
        <DishCustomizerModal
          food={food}
          restaurant={restaurant}
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </>
  );
}
