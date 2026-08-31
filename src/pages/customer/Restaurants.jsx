import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Utensils, Star, SlidersHorizontal, MapPin } from 'lucide-react';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import SearchBar from '../../components/ui/SearchBar';
import Skeleton from '../../components/common/Skeleton';
import { fetchRestaurants } from '../../redux/slices/restaurantSlice';

export default function Restaurants() {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.restaurant);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const cuisines = [
    'All',
    'Biryani',
    'Pizza',
    'Burgers',
    'North Indian',
    'Chinese',
    'Desserts',
    'Healthy',
    'South Indian',
  ];

  const filtered = (restaurants || []).filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.cuisineTypes || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine = selectedCuisine === 'All' || r.cuisineTypes?.includes(selectedCuisine);
    const matchesRating = (r.rating || 0) >= minRating;

    return matchesSearch && matchesCuisine && matchesRating;
  });

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Artisanal Dining & Kitchens
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Explore curated gourmet restaurants, cloud kitchens, and specialty dining spots
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search by restaurant name, dish, or cuisine..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={0}>All Ratings</option>
              <option value={4.0}>4.0★ & above</option>
              <option value={4.5}>4.5★ & above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cuisine Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {cuisines.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedCuisine(c)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
              selectedCuisine === c
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <Skeleton type="card" count={8} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">No kitchens found matching your filter</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Try choosing a different cuisine or clearing your search term.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('All');
                setMinRating(0);
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-orange-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
