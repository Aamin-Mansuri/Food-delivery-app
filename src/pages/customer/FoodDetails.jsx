import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Plus, Minus, ArrowLeft, Heart, ShoppingBag } from 'lucide-react';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { foodService } from '../../services/foodService';
import { addToCart, updateQuantity } from '../../redux/slices/cartSlice';

export default function FoodDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  const { items } = useSelector((state) => state.cart);
  const foodId = String(id || food?._id || food?.id);
  const cartItem = items.find((i) => String(i.food?._id || i.food?.id || i.food) === foodId);
  const isSoldOut = food?.isAvailable === false;

  useEffect(() => {
    foodService.getFoodDetails(id).then((res) => {
      setFood(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !food) {
    return <Loader label="Loading Dish Details..." />;
  }

  const handleAdd = () => {
    if (isSoldOut) return;
    const restId = food.restaurant?._id || food.restaurant || food.restaurantId;
    dispatch(
      addToCart({
        food,
        restaurant: typeof food.restaurant === 'object' ? food.restaurant : { _id: restId, deliveryFee: 30 },
      })
    );
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link to="/restaurants" className="inline-flex items-center space-x-2 text-xs font-bold text-orange-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg grid grid-cols-1 md:grid-cols-2">
          <div className="h-72 md:h-full bg-slate-100 relative">
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 ${
                    food.isVegetarian ? 'border-emerald-600' : 'border-red-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${food.isVegetarian ? 'bg-emerald-600' : 'bg-red-600'}`} />
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">{food.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</span>
              </div>

              <h1 className="text-2xl font-black text-slate-900">{food.name}</h1>

              <div className="flex items-center space-x-3">
                <span className="text-2xl font-extrabold text-slate-900">₹{food.discountPrice || food.price}</span>
                {food.discountPrice > 0 && (
                  <span className="text-sm text-slate-400 line-through">₹{food.price}</span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{food.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {isSoldOut ? (
                <button
                  disabled
                  className="w-full bg-slate-200 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed text-sm uppercase tracking-wider"
                >
                  Sold Out / Currently Unavailable
                </button>
              ) : cartItem ? (
                <div className="flex items-center justify-between bg-orange-600 text-white rounded-xl px-4 py-2.5 font-bold text-sm">
                  <span>In Cart ({cartItem.quantity})</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => dispatch(updateQuantity({ foodId, quantity: cartItem.quantity - 1 }))}
                      className="p-1 hover:bg-orange-700 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ foodId, quantity: cartItem.quantity + 1 }))}
                      className="p-1 hover:bg-orange-700 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order</span>
                </button>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
