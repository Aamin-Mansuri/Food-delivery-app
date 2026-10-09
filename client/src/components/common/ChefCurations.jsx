import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Star,
  Clock,
  ShoppingBag,
  SlidersHorizontal,
  ChefHat,
  Leaf,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { soundFX } from '../../utils/audioFeedback';
import DishCustomizerModal from '../food/DishCustomizerModal';

export default function ChefCurations() {
  const dispatch = useDispatch();
  const { foods } = useSelector((state) => state.food);
  const { restaurants } = useSelector((state) => state.restaurant);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [selectedCustomFood, setSelectedCustomFood] = useState(null);

  // Curated Chef Stories & Master Craft
  const chefStories = [
    {
      id: 'story_1',
      title: 'Nawab Handi Dum Biryani',
      cuisine: 'Mughlai & Awadhi',
      chefName: 'Master Chef Imtiaz',
      experience: '28 yrs royal Awadh heritage',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      tag: '🔥 6-HOUR DUM IN SEALED CLAY',
      highlights: ['Aged Long-grain Basmati', 'Pure Desi Ghee & Saffron', 'Kewra & Cardamom Steam'],
      price: 349,
      originalPrice: 429,
      calories: 620,
      deliveryTime: '25 min',
      rating: 4.9,
      reviewsCount: 380,
      isVeg: false,
      description:
        'Layered in artisanal terracotta handis and sealed with dough paste. Each handi is unsealed only upon your doorstep for peak aromatic vapor.',
    },
    {
      id: 'story_2',
      title: 'Burrata & Truffle Sourdough',
      cuisine: 'Artisan Neapolitan',
      chefName: 'Chef Matteo Rossi',
      experience: 'Naples Certified Pizzaiolo',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      tag: '🍕 48-HR COLD FERMENTED DOUGH',
      highlights: ['San Marzano Tomato Pulp', 'Creamy Italian Burrata', '450°C Beechwood Flame'],
      price: 499,
      originalPrice: 599,
      calories: 580,
      deliveryTime: '22 min',
      rating: 4.95,
      reviewsCount: 520,
      isVeg: true,
      description:
        'Leavened over 48 hours to develop a digestible, leopard-spotted airy crust, topped with fresh tear-away burrata and black truffle essence.',
    },
    {
      id: 'story_3',
      title: 'Smoked Truffle Brioche Smash',
      cuisine: 'Gourmet American',
      chefName: 'Chef Jordan Lee',
      experience: 'Burger Lab Innovator',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      tag: '🍔 DOUBLE CRUSTED SEAR',
      highlights: ['Golden Toasted Brioche', 'Melted Gouda & Cheddar', 'Caramelized Onion Jam'],
      price: 299,
      originalPrice: 380,
      calories: 540,
      deliveryTime: '20 min',
      rating: 4.88,
      reviewsCount: 290,
      isVeg: false,
      description:
        'Smashed ultra-thin on a blazing cast-iron flat top to lock in caramelized savory edges, layered with smoked cheese melt on warm French brioche.',
    },
  ];

  const currentStory = chefStories[activeStoryIndex];

  // Match corresponding food item in Redux store or create realistic snapshot
  const matchedFood =
    (foods || []).find((f) => f.name.toLowerCase().includes(currentStory.title.split(' ')[0].toLowerCase())) || {
      _id: currentStory.id,
      name: currentStory.title,
      price: currentStory.price,
      discountPrice: currentStory.price,
      image: currentStory.image,
      isVegetarian: currentStory.isVeg,
      rating: currentStory.rating,
      description: currentStory.description,
    };

  const matchedRestaurant = (restaurants || [])[0] || {
    _id: 'rest_curated',
    name: 'FoodRush Chef Guild Kitchen',
    deliveryTime: currentStory.deliveryTime,
    deliveryFee: 30,
  };

  const handleQuickAdd = () => {
    soundFX.playSuccess();
    dispatch(addToCart({ food: matchedFood, restaurant: matchedRestaurant }));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-900/15 px-3 py-1 rounded-full text-xs font-black text-amber-900 font-mono mb-1.5">
            <ChefHat className="w-3.5 h-3.5 text-orange-600" />
            <span>CHEF GUILD SIGNATURE CURATIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Master-Crafted Signature Specials
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Small-batch specialty dishes crafted by celebrated master chefs
          </p>
        </div>

        {/* Tab Pills for switching curated stories */}
        <div className="flex items-center space-x-1.5 bg-slate-200/60 p-1 rounded-2xl">
          {chefStories.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                soundFX.playPop();
                setActiveStoryIndex(idx);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeStoryIndex === idx
                  ? 'bg-white text-slate-900 shadow-xs scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {story.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Spotlight Showcase Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left High-Resolution Gourmet Photography */}
            <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[320px] overflow-hidden bg-slate-900 group">
              <img
                src={currentStory.image}
                alt={currentStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Tag Badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 font-mono shadow-md">
                {currentStory.tag}
              </div>

              {/* Bottom Image Stamp */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentStory.rating}</span>
                  <span className="opacity-80">({currentStory.reviewsCount}+ reviews)</span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                    currentStory.isVeg ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
                  }`}
                >
                  {currentStory.isVeg ? '🌱 VEG' : '🍗 NON-VEG'}
                </span>
              </div>
            </div>

            {/* Right Culinary Narrative & Interactive Order Card */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                {/* Chef Bio Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-orange-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                      👨‍🍳
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
                        {currentStory.chefName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{currentStory.experience}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-100">
                    ⚡ {currentStory.deliveryTime} ETA
                  </span>
                </div>

                {/* Dish Title & Description */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                    {currentStory.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-2">
                    {currentStory.description}
                  </p>
                </div>

                {/* Artisanal Ingredient Highlights */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    Artisanal Ingredient Seals:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentStory.highlights.map((h) => (
                      <span
                        key={h}
                        className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-xl border border-slate-200/80 flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & CTA Actions Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    ₹{currentStory.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{currentStory.originalPrice}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono">
                    SAVE ₹{currentStory.originalPrice - currentStory.price}
                  </span>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomFood(matchedFood)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
                    <span>Customize</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Signature Dish</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dish Customizer Modal */}
      {selectedCustomFood && (
        <DishCustomizerModal
          food={selectedCustomFood}
          restaurant={matchedRestaurant}
          isOpen={Boolean(selectedCustomFood)}
          onClose={() => setSelectedCustomFood(null)}
        />
      )}
    </div>
  );
}
