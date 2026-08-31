import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  RotateCw,
  ShoppingBag,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { soundFX } from '../../utils/audioFeedback';
import DishCustomizerModal from '../food/DishCustomizerModal';

export default function FlavorRoulette() {
  const dispatch = useDispatch();
  const { foods } = useSelector((state) => state.food);
  const { restaurants } = useSelector((state) => state.restaurant);

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMood, setSelectedMood] = useState('Spicy');
  const [resultDish, setResultDish] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const moods = [
    { id: 'Spicy', label: '🔥 Spicy Kick', keyword: 'Biryani', tag: 'Handi & Masalas' },
    { id: 'Cheesy', label: '🧀 Cheesy Comfort', keyword: 'Pizza', tag: 'Artisan Melts' },
    { id: 'Burger', label: '🍔 Juicy Smashes', keyword: 'Burger', tag: 'Brioche Labs' },
    { id: 'Healthy', label: '🥗 Clean & Green', keyword: 'Salad', tag: 'High Protein' },
    { id: 'Sweet', label: '🍰 Sweet Indulgence', keyword: 'Dessert', tag: 'Pastry & Bakes' },
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setHasSpun(true);
    soundFX.playSpin();

    // Pool candidates
    const activeMood = moods.find((m) => m.id === selectedMood);
    const pool = (foods || []).filter((f) => {
      if (selectedMood === 'Spicy') return f.isSpicy || f.name.toLowerCase().includes('biryani') || f.name.toLowerCase().includes('tikka');
      if (selectedMood === 'Cheesy') return f.name.toLowerCase().includes('pizza') || f.name.toLowerCase().includes('cheese') || f.name.toLowerCase().includes('paneer');
      if (selectedMood === 'Burger') return f.name.toLowerCase().includes('burger');
      if (selectedMood === 'Healthy') return f.isVegetarian || f.isVegan || f.name.toLowerCase().includes('bowl');
      if (selectedMood === 'Sweet') return f.name.toLowerCase().includes('cake') || f.name.toLowerCase().includes('brownie') || f.name.toLowerCase().includes('dessert') || f.name.toLowerCase().includes('sweet');
      return true;
    });

    const fallbackList = pool.length > 0 ? pool : foods || [];

    // Simulate roulette rolling with quick visual iterations
    let rollCount = 0;
    const interval = setInterval(() => {
      soundFX.playSpin();
      const randomCandidate = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      setResultDish(randomCandidate);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(interval);
        const finalDish = fallbackList[Math.floor(Math.random() * fallbackList.length)] || foods[0];
        setResultDish(finalDish);
        setIsSpinning(false);
        soundFX.playSuccess();
      }
    }, 100);
  };

  const matchedRestaurant = resultDish
    ? (restaurants || []).find((r) => r._id === (resultDish.restaurant?._id || resultDish.restaurant || resultDish.restaurantId)) || {
        _id: 'default',
        name: 'Gourmet Artisanal Kitchen',
        deliveryTime: '20-25 min',
        deliveryFee: 30,
      }
    : null;

  const handleQuickAdd = () => {
    if (!resultDish) return;
    soundFX.playSuccess();
    dispatch(addToCart({ food: resultDish, restaurant: matchedRestaurant }));
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-white">
      {/* Ambient background orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Interactive Control Panel */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 font-mono backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>AI FLAVOR ROULETTE • CAN'T DECIDE?</span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Spin Your Next Gourmet Meal
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Pick your current craving vibe, let the roulette match a master-chef special, and get an instant one-click express order.
            </p>
          </div>

          {/* Craving Mood Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">
              1. Choose Your Craving Vibe
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedMood(mood.id);
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                    selectedMood === mood.id
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-500 shadow-md scale-105'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spin Trigger CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs font-extrabold shadow-xl flex items-center justify-center space-x-2.5 transition-all uppercase tracking-wider cursor-pointer active:scale-95 ${
                isSpinning
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black shadow-orange-500/25'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning Flavor Wheel...' : 'Spin & Match Craving'}</span>
            </button>
          </div>
        </div>

        {/* Right Matched Dish Preview Spotlight */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            {resultDish ? (
              <motion.div
                key={resultDish._id || resultDish.id}
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -15 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl space-y-4"
              >
                {/* Result Match Banner */}
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[11px] font-black uppercase font-mono tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CHEF MATCH FOUND</span>
                  </span>

                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{resultDish.rating || 4.8}</span>
                  </div>
                </div>

                {/* Dish Snapshot */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-36 h-32 rounded-2xl overflow-hidden bg-slate-800 shrink-0 relative">
                    <img
                      src={resultDish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                      alt={resultDish.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono px-2 py-0.5 rounded-md">
                      {resultDish.isVegetarian ? '🌱 VEG' : '🍗 NON-VEG'}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <h4 className="text-lg font-black text-white font-display line-clamp-1">
                      {resultDish.name}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium line-clamp-1">
                      {matchedRestaurant?.name || 'Top Rated Partner Kitchen'}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 font-normal">
                      {resultDish.description || 'Prepared fresh with slow-cooked artisanal spices and sealed packaging.'}
                    </p>

                    <div className="pt-1 flex items-center justify-center sm:justify-start space-x-3 text-xs">
                      <span className="text-lg font-black text-amber-400 font-mono">
                        ₹{resultDish.discountPrice || resultDish.price}
                      </span>
                      <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>{matchedRestaurant?.deliveryTime || '25 min'} ETA</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Row */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Matched Dish to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomizerOpen(true)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
                    <span>Customize</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Idle Initial State */
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-3 backdrop-blur-md">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl">
                  🎲
                </div>
                <h4 className="text-base font-bold text-white font-display">
                  Ready to test your culinary luck?
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-normal">
                  Click the <strong>Spin & Match Craving</strong> button to trigger the flavor engine and receive a customized chef recommendation!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Customizer Modal for Result Dish */}
      {isCustomizerOpen && resultDish && (
        <DishCustomizerModal
          food={resultDish}
          restaurant={matchedRestaurant}
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </div>
  );
}
