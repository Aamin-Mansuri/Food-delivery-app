import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
  UtensilsCrossed,
  Percent,
  Filter,
  Search,
  MapPin,
  Clock,
  Star,
  Flame,
  ChevronDown,
  X,
  Truck,
  Award,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  ChefHat,
  Radio,
  Compass,
  Heart,
  LayoutGrid,
  List,
} from 'lucide-react';

import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/food/FoodCard';
import CouponCard from '../../components/ui/CouponCard';
import Skeleton from '../../components/common/Skeleton';
import FlavorRoulette from '../../components/common/FlavorRoulette';
import ChefCurations from '../../components/common/ChefCurations';
import LiveStatsTicker from '../../components/common/LiveStatsTicker';
import PromotionalBanner from '../../components/common/PromotionalBanner';
import { soundFX } from '../../utils/audioFeedback';

import { fetchRestaurants } from '../../redux/slices/restaurantSlice';
import { fetchFoods } from '../../redux/slices/foodSlice';
import { fetchCoupons } from '../../redux/slices/couponSlice';

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { restaurants, loading: restLoading } = useSelector((state) => state.restaurant);
  const { foods, loading: foodLoading } = useSelector((state) => state.food);
  const { coupons } = useSelector((state) => state.coupon);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedLocation, setSelectedLocation] = useState('Bandra West, Mumbai');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [ovenTimerSeconds, setOvenTimerSeconds] = useState(258);

  // Live timer countdown simulation for kitchen radar
  useEffect(() => {
    const timer = setInterval(() => {
      setOvenTimerSeconds((prev) => (prev > 10 ? prev - 1 : 320));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    dispatch(fetchRestaurants());
    dispatch(fetchFoods());
    dispatch(fetchCoupons());
  }, [dispatch]);

  const locations = [
    'Bandra West, Mumbai',
    'Juhu & Vile Parle, Mumbai',
    'Powai & Hiranandani, Mumbai',
    'Indiranagar, Bengaluru',
    'Connaught Place, New Delhi',
  ];

  const culinaryMoods = [
    { name: 'All', icon: '🍽️', label: 'All Cravings', tagline: 'All Outlets', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=240&q=80' },
    { name: 'Biryani', icon: '🍲', label: 'Dum Biryani', tagline: 'Claypot & Handi', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=240&q=80' },
    { name: 'Pizza', icon: '🍕', label: 'Artisan Pizza', tagline: 'Wood-Fired Crusts', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=240&q=80' },
    { name: 'Burgers', icon: '🍔', label: 'Smash Burgers', tagline: 'Gourmet Brioche', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=240&q=80' },
    { name: 'North Indian', icon: '🥘', label: 'North Indian', tagline: 'Rich Curries & Naan', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=240&q=80' },
    { name: 'Chinese', icon: '🥢', label: 'Pan Asian', tagline: 'Wok & Dimsums', image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=240&q=80' },
    { name: 'Desserts', icon: '🍰', label: 'Desserts & Bakes', tagline: 'Sweet Indulgences', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=240&q=80' },
    { name: 'Healthy', icon: '🥗', label: 'Clean Bowls', tagline: 'High Protein & Vegan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=240&q=80' },
  ];

  const trendingTags = [
    '🔥 Hyderabadi Dum Biryani',
    '🍕 Sourdough Neapolitan',
    '🍔 Truffle Smash Burger',
    '🍲 Butter Chicken & Garlic Naan',
    '🌱 Pure Veg Thali',
    '🍰 Belgian Dark Choco Molten',
  ];

  const scrollToSection = (id) => {
    soundFX.playPop();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickTagClick = (tag) => {
    soundFX.playPop();
    const cleaned = tag.replace(/^[^\w\s]+/, '').trim();
    if (cleaned.includes('Biryani')) {
      setSelectedCategory('Biryani');
    } else if (cleaned.includes('Neapolitan') || cleaned.includes('Pizza')) {
      setSelectedCategory('Pizza');
    } else if (cleaned.includes('Burger') || cleaned.includes('Brioche')) {
      setSelectedCategory('Burgers');
    } else if (cleaned.includes('Protein') || cleaned.includes('Greens') || cleaned.includes('Veg')) {
      setSelectedCategory('Healthy');
    } else if (cleaned.includes('Choco') || cleaned.includes('Molten')) {
      setSelectedCategory('Desserts');
    } else {
      setSelectedCategory('All');
    }

    const el = document.getElementById('featured-restaurants-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered & Sorted Featured Restaurants
  const filteredRestaurants = useMemo(() => {
    return (restaurants || [])
      .filter((r) => {
        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = r.name?.toLowerCase().includes(q);
          const matchesCuisine = r.cuisineTypes?.some((c) => c.toLowerCase().includes(q));
          const matchesAddress = r.address?.toLowerCase?.()?.includes(q) || r.location?.address?.toLowerCase?.()?.includes(q);
          if (!matchesName && !matchesCuisine && !matchesAddress) return false;
        }

        // Category Filter
        if (selectedCategory !== 'All' && !r.cuisineTypes?.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) {
          return false;
        }

        // Veg Only Filter
        if (filterVegOnly && !r.isVegetarian) {
          return false;
        }

        // 4.0+ Star Rating Filter
        if (filterTopRated && (r.rating || 0) < 4.0) {
          return false;
        }

        // Fast Delivery (< 30 min)
        if (filterFastDelivery) {
          const time = parseInt(r.deliveryTime || '30', 10);
          if (time > 30) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'delivery') return parseInt(a.deliveryTime || '30', 10) - parseInt(b.deliveryTime || '30', 10);
        if (sortBy === 'cost_low') return (a.minimumOrder || 100) - (b.minimumOrder || 100);
        return 0;
      });
  }, [restaurants, searchQuery, selectedCategory, filterVegOnly, filterTopRated, filterFastDelivery, sortBy]);

  // Filtered foods for Trending section
  const filteredFoods = useMemo(() => {
    return (foods || []).filter((f) => {
      if (filterVegOnly && !f.isVegetarian) return false;
      if (selectedCategory !== 'All') {
        const catName = typeof f.category === 'string' ? f.category : f.category?.name;
        if (catName && catName.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [foods, filterVegOnly, selectedCategory]);

  const resetAllFilters = () => {
    soundFX.playPop();
    setSearchQuery('');
    setSelectedCategory('All');
    setFilterVegOnly(false);
    setFilterTopRated(false);
    setFilterFastDelivery(false);
    setSortBy('rating');
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (filterVegOnly ? 1 : 0) +
    (filterTopRated ? 1 : 0) +
    (filterFastDelivery ? 1 : 0);

  // State for hero interactive featured showcase
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const heroDishes = [
    {
      id: 1,
      title: 'Royal Dum Matka Biryani',
      subtitle: 'Slow cooked in sealed claypots with saffron & royal cardamom spices',
      rating: '4.9',
      reviews: '2.4k+',
      time: '20-25 min',
      tag: 'CHEF SPECIAL',
      offer: 'FLAT 50% OFF',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      restaurantName: 'Nawab Dum Handi Kitchen',
      price: '₹280',
      originalPrice: '₹450',
      category: 'Biryani',
    },
    {
      id: 2,
      title: 'Artisan Truffle Margherita',
      subtitle: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil & truffle oil',
      rating: '4.8',
      reviews: '1.8k+',
      time: '18-22 min',
      tag: 'WOODFIRED',
      offer: 'FREE GARLIC BREAD',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      restaurantName: 'Gusto Pizzeria Napoletana',
      price: '₹340',
      originalPrice: '₹480',
      category: 'Pizza',
    },
    {
      id: 3,
      title: 'Double Smash Brioche Burger',
      subtitle: 'Juicy prime patties, melted aged cheddar, caramelized onions & secret glaze',
      rating: '4.9',
      reviews: '3.1k+',
      time: '15-20 min',
      tag: 'MUST TRY',
      offer: 'FLAT 40% OFF',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      restaurantName: 'Crumb & Patty Gourmet Lab',
      price: '₹220',
      originalPrice: '₹320',
      category: 'Burgers',
    },
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroDishes.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, [heroDishes.length]);

  return (
    <div className="w-full space-y-10 sm:space-y-12 pb-20">
      
      {/* 1. ATTRACTIVE HERO SECTION (NO SEARCH OPTION) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-amber-50/30 to-white border-b border-slate-200/80">
        {/* Ambient background glow */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Location & Status Header Tag */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setIsLocationDropdownOpen(!isLocationDropdownOpen);
                    }}
                    className="inline-flex items-center space-x-2 bg-white/90 hover:bg-white border border-orange-200/90 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-slate-900 font-semibold">{selectedLocation}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isLocationDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Delivery Zone
                      </div>
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            soundFX.playPop();
                            setSelectedLocation(loc);
                            setIsLocationDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center space-x-2 cursor-pointer font-medium"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          <span>{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center space-x-1.5 bg-orange-100/70 border border-orange-200/60 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>50+ Top Kitchens Open</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Delicious Food, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                    Delivered In Minutes.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  Experience chef-crafted recipes, sizzling authentic appetizers, and hearty gourmet meals prepared fresh and delivered fast to your doorstep.
                </p>
              </div>

              {/* Primary Call to Actions (No search bar) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    scrollToSection('featured-restaurants-section');
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-600/20 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explore Restaurants</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    scrollToSection('vip-passes-section');
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-800 hover:text-orange-600 font-bold text-sm px-5 py-3 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Percent className="w-4 h-4 text-orange-500" />
                  <span>View Today's Deals</span>
                </button>
              </div>

              {/* Quick Craving Mood Chips */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>What are you craving today?</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {culinaryMoods.slice(1, 8).map((mood) => {
                    const isSelected = selectedCategory === mood.name;
                    return (
                      <button
                        key={mood.name}
                        type="button"
                        onClick={() => {
                          soundFX.playPop();
                          setSelectedCategory(mood.name);
                          scrollToSection('featured-restaurants-section');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 border ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/60 shadow-2xs'
                        }`}
                      >
                        <span className="text-sm">{mood.icon}</span>
                        <span>{mood.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-3 sm:gap-6">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">20-30 Min</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Express Delivery</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">4.8+ Stars</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Top Kitchens</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">100% Safe</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Hygiene Sealed</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Interactive Gourmet Dish Showcase */}
            <div className="lg:col-span-5">
              <div className="relative">
                
                {/* Active Showcase Card */}
                {heroDishes.map((dish, idx) => {
                  if (idx !== activeHeroSlide) return null;
                  return (
                    <motion.div
                      key={dish.title}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xl overflow-hidden"
                    >
                      {/* Image Thumbnail with Rich Badges */}
                      <div className="relative h-64 sm:h-76 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/30 to-transparent" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-2">
                          <span className="bg-white/95 text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span>{dish.tag}</span>
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 bg-orange-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                          {dish.offer}
                        </div>

                        {/* Dish Overlay Details */}
                        <div className="absolute bottom-3 left-3 right-3 text-white space-y-1.5">
                          <p className="text-xs text-amber-300 font-bold">{dish.restaurantName}</p>
                          <h3 className="text-lg sm:text-xl font-black leading-tight line-clamp-1">{dish.title}</h3>
                          <p className="text-xs text-slate-200 line-clamp-1 font-normal">{dish.subtitle}</p>

                          <div className="flex items-center justify-between text-xs pt-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 text-[11px]">
                                <span>{dish.rating}</span>
                                <Star className="w-3 h-3 fill-current" />
                              </span>
                              <span className="text-slate-300 text-[11px]">({dish.reviews})</span>
                            </div>

                            <div className="flex items-center space-x-1.5 font-bold">
                              <span className="text-base text-white">{dish.price}</span>
                              <span className="text-slate-400 line-through text-xs">{dish.originalPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="pt-3 px-1 flex items-center justify-between">
                        {/* Slide Selector Dots */}
                        <div className="flex items-center space-x-1.5">
                          {heroDishes.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => {
                                soundFX.playPop();
                                setActiveHeroSlide(dotIdx);
                              }}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                dotIdx === activeHeroSlide
                                  ? 'w-7 bg-orange-600'
                                  : 'w-2 bg-slate-200 hover:bg-slate-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playPop();
                            setSelectedCategory(dish.category);
                            scrollToSection('featured-restaurants-section');
                          }}
                          className="bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Order {dish.category}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

        {/* 1. ONGOING OFFERS & FIRST-ORDER FREE DELIVERY BANNER */}
        <PromotionalBanner
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onScrollToSection={scrollToSection}
        />

        {/* 2. EXCLUSIVE PROMOTIONAL PASSES */}
        <section id="vip-passes-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-display">
                VIP Culinary Deals & Promo Passes
              </h3>
            </div>
            <span className="text-xs font-bold text-orange-600 hover:underline cursor-pointer">
              Auto-applies at checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(coupons || []).slice(0, 3).map((coupon) => (
              <CouponCard key={coupon._id} coupon={coupon} />
            ))}
          </div>
        </section>

        {/* 3. MASTER CHEF CURATIONS SPOTLIGHT */}
        <section id="chef-curations-section">
          <ChefCurations />
        </section>

        {/* 4. INTERACTIVE FLAVOR ROULETTE (CRAVING WHEEL) */}
        <section id="flavor-roulette-section">
          <FlavorRoulette />
        </section>

        {/* 5. TASTE MOODS & CUISINE COLLECTION BAR */}
        <section id="culinary-categories-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Explore Cuisines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse our handpicked selections by food category
              </p>
            </div>

            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {culinaryMoods.map((mood) => {
              const isSelected = selectedCategory === mood.name;
              return (
                <button
                  key={mood.name}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedCategory(mood.name);
                  }}
                  className={`p-3 rounded-2xl text-center transition-all border flex flex-col items-center justify-center space-y-2 cursor-pointer bg-white ${
                    isSelected
                      ? 'border-orange-500 shadow-sm ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 p-0.5">
                    <img
                      src={mood.image}
                      alt={mood.label}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold line-clamp-1 ${isSelected ? 'text-orange-600' : 'text-slate-800'}`}>
                      {mood.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 7. FEATURED PARTNER RESTAURANTS SECTION */}
        <section id="featured-restaurants-section" className="space-y-6 pt-2">
          {/* Header & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Restaurants near you
                </h2>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {filteredRestaurants.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Showing open kitchens delivering to {selectedLocation}
              </p>
            </div>

            {/* Filter Pills Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Pure Veg Pill */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setFilterVegOnly(!filterVegOnly);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  filterVegOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filterVegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
                <span>Pure Veg</span>
              </button>

              {/* 4.0+ Star Rating */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setFilterTopRated(!filterTopRated);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  filterTopRated
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterTopRated ? 'fill-current text-white' : 'fill-current text-amber-500'}`} />
                <span>4.0+ Rating</span>
              </button>

              {/* Fast Delivery (< 30 min) */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setFilterFastDelivery(!filterFastDelivery);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  filterFastDelivery
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Fast Delivery</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    soundFX.playPop();
                    setSortBy(e.target.value);
                  }}
                  className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="rating">Top Rated</option>
                  <option value="delivery">Fastest Delivery</option>
                  <option value="cost_low">Min Order: Low to High</option>
                </select>
              </div>

              {/* Clear All Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Search & Filter Banner */}
          {(searchQuery || selectedCategory !== 'All' || filterVegOnly || filterTopRated || filterFastDelivery) && (
            <div className="bg-amber-500/10 border border-amber-900/15 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-bold text-amber-950 font-mono uppercase text-[11px]">Applied Filters:</span>
                {searchQuery && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 font-bold text-orange-800">
                    "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 font-bold text-orange-800">
                    {selectedCategory}
                  </span>
                )}
                {filterVegOnly && (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    Pure Veg
                  </span>
                )}
                {filterTopRated && (
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                    4.0+ Rating
                  </span>
                )}
                {filterFastDelivery && (
                  <span className="bg-orange-100 text-orange-900 px-2 py-0.5 rounded-md font-bold">
                    &lt; 30 min
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetAllFilters}
                className="font-bold text-orange-700 hover:text-orange-900 underline shrink-0 ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Restaurants Grid */}
          {restLoading ? (
            <Skeleton type="card" count={4} />
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-3">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
                <Utensils className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-display">No kitchens match your taste filters</h4>
              <p className="text-slate-500 font-medium text-xs max-w-md mx-auto">
                Try searching for a different dish, selecting another cuisine, or resetting your filter preferences.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="bg-slate-900 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>

        {/* 8. TRENDING DISHES STUDIO */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Popular dishes
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Most loved orders in {selectedLocation.split(',')[0]}
              </p>
            </div>

            <Link
              to="/restaurants"
              className="flex items-center space-x-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {foodLoading ? (
            <Skeleton type="card" count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods.slice(0, 8).map((food) => {
                const restId = food.restaurant?._id || food.restaurant || food.restaurantId;
                const rest = (restaurants || []).find((r) => r._id === restId) || {
                  _id: restId,
                  name: 'FoodRush Kitchen',
                  deliveryFee: 30,
                };
                return <FoodCard key={food._id} food={food} restaurant={rest} />;
              })}
            </div>
          )}
        </section>

        {/* 9. REAL-TIME CULINARY METRICS */}
        <section>
          <LiveStatsTicker />
        </section>

        {/* 10. HOW IT WORKS PROMISE BANNER */}
        <section className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-sm border border-slate-800">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              How FoodRush Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Fresh preparation, thermal packaging, and fast doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Freshly Prepared</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Partner restaurants begin cooking as soon as your order is received.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Quality Packed</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sealed carefully in temperature-preserving tamper-proof containers.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Delivered safely to your doorstep by friendly delivery partners.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

