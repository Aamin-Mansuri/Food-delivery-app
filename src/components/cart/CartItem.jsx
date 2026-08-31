import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../redux/slices/cartSlice';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const foodId = String(item?.food?._id || item?.food?.id || item?.food || item?.foodId || item?._id || 'food_item');
  const foodName = item?.food?.name || item?.name || 'Food Item';
  const isVeg = item?.food?.isVegetarian !== undefined ? item?.food?.isVegetarian : true;
  const unitPrice = item?.price || item?.food?.discountPrice || item?.food?.price || 0;
  const quantity = item?.quantity || 1;

  const handleIncrease = () => {
    dispatch(updateQuantity({ foodId, quantity: quantity + 1 }));
  };

  const handleDecrease = () => {
    dispatch(updateQuantity({ foodId, quantity: quantity - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(foodId));
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center space-x-3 flex-1 pr-2">
        <span
          className={`w-3 h-3 rounded-sm border shrink-0 flex items-center justify-center ${
            isVeg ? 'border-emerald-600' : 'border-red-600'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
        </span>
        <div className="line-clamp-1">
          <p className="text-sm font-semibold text-slate-800">{foodName}</p>
          <p className="text-xs text-slate-400">₹{unitPrice} each</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button onClick={handleDecrease} className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs font-bold text-slate-800">{quantity}</span>
          <button onClick={handleIncrease} className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <span className="text-sm font-bold text-slate-900 w-12 text-right">
          ₹{unitPrice * quantity}
        </span>

        <button onClick={handleRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
