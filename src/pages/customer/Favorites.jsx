import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import FoodCard from '../../components/food/FoodCard';
import { fetchFavorites } from '../../redux/slices/favoriteSlice';

export default function Favorites() {
  const dispatch = useDispatch();
  const { restaurants, foods } = useSelector((state) => state.favorite);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
          <h1 className="text-3xl font-black text-slate-900">Your Favorite Foods & Restaurants</h1>
          <p className="text-xs text-slate-500 font-medium">Quick access to your bookmarked kitchens and dishes</p>
        </div>

        {/* Favorite Restaurants */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Saved Restaurants ({restaurants.length})</h2>
          {restaurants.length === 0 ? (
            <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-100">
              No favorite restaurants saved yet. Click the heart icon on any restaurant card to bookmark it!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>

        {/* Favorite Foods */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Saved Dishes ({foods.length})</h2>
          {foods.length === 0 ? (
            <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-100">
              No favorite dishes saved yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foods.map((food) => {
                const restId = food.restaurant?._id || food.restaurant || food.restaurantId;
                return (
                  <FoodCard
                    key={food._id}
                    food={food}
                    restaurant={{ _id: restId, name: 'FoodRush Kitchen', deliveryFee: 30 }}
                  />
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}
