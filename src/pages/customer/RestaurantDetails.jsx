import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, MapPin, Star, Heart, ShoppingBag, ArrowRight, ShieldCheck, Flame, Sparkles, ChefHat } from 'lucide-react';

import FoodCard from '../../components/food/FoodCard';
import Rating from '../../components/common/Rating';
import Loader from '../../components/common/Loader';
import { soundFX } from '../../utils/audioFeedback';

import { fetchRestaurantDetails } from '../../redux/slices/restaurantSlice';
import { fetchFoods } from '../../redux/slices/foodSlice';
import { toggleCartDrawer } from '../../redux/slices/cartSlice';

export default function RestaurantDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedRestaurant, loading } = useSelector((state) => state.restaurant);
  const { foods } = useSelector((state) => state.food);
  const { items } = useSelector((state) => state.cart);

  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurantDetails(id));
    dispatch(fetchFoods({ restaurantId: id }));
  }, [dispatch, id]);

  if (loading || !selectedRestaurant) {
    return <Loader fullScreen={false} label="Loading Restaurant Menu..." />;
  }

  const restaurantFoods = (foods || []).filter(
    (f) =>
      f.restaurant === id ||
      f.restaurant?._id === id ||
      f.restaurantId === id ||
      f.restaurantId?._id === id
  );

  const categories = ['All', ...new Set(restaurantFoods.map((f) => (typeof f.category === 'string' ? f.category : f.category?.name || 'Popular')))];

  const filteredFoods = restaurantFoods.filter((f) => {
    const catName = typeof f.category === 'string' ? f.category : f.category?.name || 'Popular';
    if (activeCategory !== 'All' && catName !== activeCategory) return false;
    if (vegOnly && !f.isVegetarian) return false;
    return true;
  });

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = items.reduce((acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1), 0);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* Header Hero Card */}
      <div className="bg-[#0D1117] text-white rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative">
        <div className="relative h-64 sm:h-80">
          <img
            src={selectedRestaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}
            alt={selectedRestaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/60 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="bg-orange-600/90 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider backdrop-blur-md shadow-xs font-mono">
              {selectedRestaurant.isOpen ? '🟢 OPEN FOR ORDERS' : '🔴 CURRENTLY CLOSED'}
            </span>

            <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FSSAI Certified Kitchen</span>
            </div>
          </div>

          {/* Bottom Details Bar */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono tracking-wider uppercase">
                {(selectedRestaurant.cuisineTypes || []).join(' • ')}
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display">
                {selectedRestaurant.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center space-x-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>{selectedRestaurant.address?.area || 'Bandra West'}, {selectedRestaurant.address?.city || 'Mumbai'}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/15 flex items-center space-x-4 shrink-0 shadow-xl">
              <div className="text-center pr-4 border-r border-white/20">
                <div className="flex items-center space-x-1 justify-center text-amber-400 font-black text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{selectedRestaurant.rating || 4.8}</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">{selectedRestaurant.totalReviews || 120}+ reviews</p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-white font-bold flex items-center justify-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>{selectedRestaurant.deliveryTime || '25-30m'}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Delivery Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Bar & Veg Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playPop();
            setVegOnly(!vegOnly);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
            vegOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
          <span>Pure Veg Only</span>
        </button>
      </div>

      {/* Food Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredFoods.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 font-display">No dishes in this category</h4>
            <p className="text-xs text-slate-400">Try selecting another menu section or clearing the veg filter.</p>
          </div>
        ) : (
          filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} restaurant={selectedRestaurant} />
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-[#0D1117] text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between z-40 border border-slate-700 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
              {cartCount}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">CART SUBTOTAL</p>
              <p className="text-lg font-black text-white">₹{cartSubtotal}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(toggleCartDrawer(true))}
            className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-orange-600/30 transition-all text-xs flex items-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
