import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import SearchBar from '../../components/ui/SearchBar';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/food/FoodCard';
import { fetchRestaurants } from '../../redux/slices/restaurantSlice';
import { fetchFoods } from '../../redux/slices/foodSlice';

export default function Search() {
  const dispatch = useDispatch();
  const { restaurants } = useSelector((state) => state.restaurant);
  const { foods } = useSelector((state) => state.food);

  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchRestaurants());
    dispatch(fetchFoods());
  }, [dispatch]);

  const matchedRestaurants = (restaurants || []).filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      (r.cuisineTypes || []).some((c) => c.toLowerCase().includes(query.toLowerCase()))
  );

  const matchedFoods = (foods || []).filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-2xl mx-auto">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search for 'Biryani', 'Pizza', 'Burger', or restaurant..."
          />
        </div>

        {query.trim() === '' ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Type to start searching</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Search across hundreds of top dishes, cloud kitchens, and gourmet dining outlets.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Matching Restaurants */}
            {matchedRestaurants.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-xl">Matching Outlets ({matchedRestaurants.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {matchedRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            {/* Matching Dishes */}
            {matchedFoods.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-xl">Matching Dishes ({matchedFoods.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedFoods.map((food) => {
                    const restId = food.restaurant?._id || food.restaurant || food.restaurantId;
                    const rest = (restaurants || []).find((r) => r._id === restId) || {
                      _id: restId,
                      deliveryFee: 30,
                    };
                    return <FoodCard key={food._id} food={food} restaurant={rest} />;
                  })}
                </div>
              </div>
            )}

            {matchedRestaurants.length === 0 && matchedFoods.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500 font-medium text-sm">No dishes or restaurants found for "{query}".</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
