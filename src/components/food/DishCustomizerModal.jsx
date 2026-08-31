import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Flame,
  Star,
  ShieldCheck,
  Heart,
  Check,
  ShoppingBag,
  Info,
  ChefHat,
  Leaf,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { soundFX } from '../../utils/audioFeedback';

export default function DishCustomizerModal({ food, restaurant, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState(food?.isSpicy ? 'Hot' : 'Medium');
  const [instructions, setInstructions] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !food) return null;

  const basePrice = food.discountPrice > 0 ? food.discountPrice : food.price || 199;

  // Realistic gourmet add-on choices based on dish cuisine
  const availableAddons = [
    { id: 'truffle_dip', name: 'Artisanal Truffle Garlic Dip', price: 35, icon: '🧄' },
    { id: 'extra_cheese', name: 'Smoked Gouda & Cheddar Melt', price: 49, icon: '🧀' },
    { id: 'crispy_fries', name: 'Peri-Peri Herb Crust Fries', price: 59, icon: '🍟' },
    { id: 'caramelized_onion', name: 'Slow-Cooked Caramelized Onions', price: 29, icon: '🧅' },
    { id: 'extra_portion', name: 'Chef Double Gourmet Portion', price: 89, icon: '✨' },
  ];

  const toggleAddon = (addon) => {
    soundFX.playPop();
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const itemFinalPrice = (basePrice + addonsTotal) * quantity;

  // Estimated nutrition breakdown
  const calories = Math.round((food.price || 200) * 1.8 + selectedAddons.length * 45);
  const protein = Math.round(calories * 0.05);
  const carbs = Math.round(calories * 0.11);
  const fat = Math.round(calories * 0.04);

  const handleAddToCart = () => {
    soundFX.playSuccess();
    setAddedSuccess(true);

    const customizedFood = {
      ...food,
      customizations: {
        addons: selectedAddons,
        spiceLevel,
        instructions,
        customPrice: basePrice + addonsTotal,
      },
    };

    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({ food: customizedFood, restaurant }));
    }

    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header Image with Badges */}
          <div className="relative h-60 sm:h-64 shrink-0 overflow-hidden bg-slate-900">
            <img
              src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
              alt={food.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                  food.isVegetarian
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-red-500/90 text-white'
                }`}
              >
                {food.isVegetarian ? '🌱 Pure Vegetarian' : '🍗 Non-Vegetarian'}
              </span>

              {food.isBestSeller && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>CHEF'S SPECIAL</span>
                </span>
              )}
            </div>

            {/* Dish Title & Price on Image bottom */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display line-clamp-1">
                  {food.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {restaurant?.name || 'Artisanal Partner Kitchen'}
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-white text-right">
                <span className="text-xs font-mono opacity-80 block">Base Price</span>
                <span className="text-lg font-black font-mono">₹{basePrice}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Customization Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Description */}
            <div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {food.description ||
                  'Crafted with premium farm-fresh ingredients, slow-simmered artisanal seasoning, and served steaming hot in sealed temperature-lock packaging.'}
              </p>
            </div>

            {/* Nutrition & Macro Highlights */}
            <div className="bg-amber-500/5 border border-amber-900/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-600" />
                  <span className="uppercase tracking-wider font-mono text-[11px]">Estimated Nutrition per Portion</span>
                </span>
                <span className="text-orange-700 font-black font-mono">{calories} kcal</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Protein</span>
                  <span className="text-xs font-black text-slate-800">{protein}g</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Carbs</span>
                  <span className="text-xs font-black text-slate-800">{carbs}g</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Healthy Fats</span>
                  <span className="text-xs font-black text-slate-800">{fat}g</span>
                </div>
              </div>
            </div>

            {/* Spice Intensity Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 font-mono">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>Select Spice Preference</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {['Mild & Balanced', 'Medium Savory', 'Fiery Hot 🌶️'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setSpiceLevel(level);
                    }}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                      spiceLevel === level
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Gourmet Add-Ons Checkbox List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Artisanal Add-ons & Sides</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>

              <div className="space-y-2">
                {availableAddons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-orange-400 text-slate-900'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{addon.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{addon.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">+₹{addon.price}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kitchen Instructions Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 font-mono">
                <ChefHat className="w-3.5 h-3.5 text-slate-500" />
                <span>Special Cooking Note for the Chef</span>
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Less sodium, crispy crust, pack dressing separately..."
                className="w-full text-xs font-medium px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
            
            {/* Quantity Stepper */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-black transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-black font-mono text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setQuantity((q) => q + 1);
                }}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-black transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button with animated feedback */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-extrabold shadow-lg transition-all active:scale-98 cursor-pointer uppercase tracking-wider ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/30 hover:opacity-95'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{addedSuccess ? 'Added to Cart!' : 'Add to Order'}</span>
              </div>
              <span className="font-mono text-sm">₹{itemFinalPrice}</span>
            </button>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
