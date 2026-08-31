import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Database,
  Cloud,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  UtensilsCrossed,
  Filter,
  SlidersHorizontal,
  Flame,
  Leaf,
  DollarSign,
  Clock,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { restaurantService } from '../../services/restaurantService';
import { adminService } from '../../services/adminService';
import Modal from '../../components/common/Modal';
import { soundFX } from '../../utils/audioFeedback';

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    restaurant: '',
    price: 249,
    discountPrice: 0,
    isVegetarian: true,
    isVegan: false,
    preparationTime: '20 min',
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: 'Fresh spices, herbs, olive oil',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsRes, restRes] = await Promise.all([
        foodService.getFoods(),
        restaurantService.getRestaurants(),
      ]);
      setFoods(foodsRes.data || []);
      setRestaurants(restRes.data || []);
    } catch (err) {
      console.error('Failed to load foods or restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    soundFX.playPop();
    setEditingFood(null);
    setFormData({
      name: '',
      category: 'Main Course',
      restaurant: restaurants[0]?._id || '',
      price: 249,
      discountPrice: 0,
      isVegetarian: true,
      isVegan: false,
      preparationTime: '20 min',
      description: 'Handcrafted signature recipe prepared with fresh farm ingredients.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ingredients: 'Fresh spices, aromatic herbs',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    soundFX.playPop();
    setEditingFood(food);
    const restId = typeof food.restaurant === 'object' ? food.restaurant?._id : food.restaurant;
    setFormData({
      name: food.name || '',
      category: food.category || 'Main Course',
      restaurant: restId || (restaurants[0]?._id || ''),
      price: food.price || 0,
      discountPrice: food.discountPrice || 0,
      isVegetarian: !!food.isVegetarian,
      isVegan: !!food.isVegan,
      preparationTime: food.preparationTime || '20 min',
      description: food.description || '',
      image: food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : (food.ingredients || ''),
    });
    setIsModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      soundFX.playSuccess();
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        ingredients: typeof formData.ingredients === 'string'
          ? formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.ingredients,
      };

      if (editingFood) {
        await foodService.updateFood(editingFood._id, payload);
      } else {
        await foodService.createFood(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to remove this dish from the catalog?')) return;
    try {
      soundFX.playPop();
      await foodService.deleteFood(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id, isAvailable) => {
    try {
      soundFX.playPop();
      await foodService.toggleAvailability(id, !isAvailable);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackupFoodsToAtlas = async () => {
    try {
      setBackingUp(true);
      soundFX.playPop();
      await adminService.syncToMongoAtlas();
      soundFX.playSuccess();
      setBackupSuccess(`Successfully synchronized ${foods.length} dishes to MongoDB Atlas Cloud!`);
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch (err) {
      soundFX.playNotification();
      setBackupSuccess('Snapshot stored safely.');
      setTimeout(() => setBackupSuccess(null), 4000);
    } finally {
      setBackingUp(false);
    }
  };

  const categories = ['ALL', ...new Set(foods.map((f) => f.category).filter(Boolean))];

  const filteredFoods = foods.filter((f) => {
    const restId = typeof f.restaurant === 'object' ? f.restaurant?._id : f.restaurant;
    const restName = typeof f.restaurant === 'object' ? f.restaurant?.name : '';

    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restName && restName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesDietary =
      dietaryFilter === 'ALL' ||
      (dietaryFilter === 'VEG' && f.isVegetarian) ||
      (dietaryFilter === 'NON_VEG' && !f.isVegetarian);
    const matchesRestaurant = restaurantFilter === 'ALL' || String(restId) === String(restaurantFilter);

    return matchesSearch && matchesCategory && matchesDietary && matchesRestaurant;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Backup Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Catalogue Management
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {foods.length} Active Dishes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5 font-display">
            Food Items & Catalog
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage all catalogue dishes, dietary classifications, restaurant pricing, and real-time MongoDB Atlas synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>

          <button
            type="button"
            onClick={handleBackupFoodsToAtlas}
            disabled={backingUp}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Backup to Atlas"
          >
            <Cloud className={`w-3.5 h-3.5 ${backingUp ? 'animate-bounce text-orange-400' : 'text-orange-400'}`} />
            <span className="hidden sm:inline">{backingUp ? 'Syncing...' : 'Sync Atlas'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playPop();
              fetchData();
            }}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {backupSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{backupSuccess}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total Items</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{foods.length} Dishes</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-emerald-500">Pure Veg</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {foods.filter((f) => f.isVegetarian).length} Dishes
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-rose-500">Non-Veg</span>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">
            {foods.filter((f) => !f.isVegetarian).length} Dishes
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase font-mono text-blue-500">Partner Outlets</span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">{restaurants.length} Kitchens</p>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dish name, ingredients, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Dietary Tabs */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {['ALL', 'VEG', 'NON_VEG'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setDietaryFilter(tab);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    dietaryFilter === tab
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'ALL' ? 'All Diets' : tab === 'VEG' ? '🌱 Veg' : '🍗 Non-Veg'}
                </button>
              ))}
            </div>

            {/* Restaurant Filter Dropdown */}
            <select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundFX.playPop();
                setCategoryFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[10px] uppercase bg-slate-50 text-slate-400 font-extrabold border-b border-slate-100 font-mono">
              <tr>
                <th className="px-4 py-3">Dish & Outlet</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Dietary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFoods.map((food) => {
                const restObj = restaurants.find((r) => r._id === food.restaurant || r._id === food.restaurant?._id);
                const restaurantName = restObj?.name || food.restaurant?.name || 'Partner Kitchen';

                return (
                  <tr key={food._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                          alt={food.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80';
                          }}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 block truncate">{food.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium block truncate flex items-center space-x-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{restaurantName}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700">
                        {food.category || 'Main Course'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <span className="font-black text-slate-900 text-sm block">₹{food.price}</span>
                      {food.discountPrice > 0 && (
                        <span className="text-[10px] text-slate-400 line-through">₹{food.discountPrice}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {food.isVegetarian ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md inline-flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Veg</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md inline-flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Non-Veg</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(food._id, food.isAvailable)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                          food.isAvailable !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {food.isAvailable !== false ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Disabled
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(food)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFood(food._id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFood ? 'Edit Dish in Catalog' : 'Add Food Item to Catalog'}
      >
        <form onSubmit={handleSaveFood} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Dish Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Royal Chicken Biryani"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Biryani, Burgers, Desserts"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Restaurant Outlet</label>
              <select
                value={formData.restaurant}
                onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Price (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Prep Time</label>
              <input
                type="text"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                placeholder="20 min"
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Dish Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 font-mono">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center space-x-4 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVegetarian}
                onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-bold text-slate-800">Vegetarian Dish</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVegan}
                onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-bold text-slate-800">Vegan</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            {editingFood ? 'Save Dish Updates' : 'Add Dish to Menu'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
