import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { foodService } from '../../services/foodService';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function RestaurantMenu() {
  const [foods, setFoods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    price: '',
    isVegetarian: true,
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    const res = await foodService.getFoods({});
    setFoods(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newFood.name);
    formData.append('description', newFood.description);
    formData.append('price', newFood.price);
    formData.append('isVegetarian', newFood.isVegetarian);

    await foodService.createFood(formData);
    setIsModalOpen(false);
    loadMenu();
  };

  const handleDelete = async (id) => {
    await foodService.deleteFood(id);
    loadMenu();
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    await foodService.toggleAvailability(id, !currentStatus);
    loadMenu();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Menu Management</h1>
            <p className="text-xs text-slate-500 font-medium">Add, update, and manage kitchen dishes</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-orange-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => {
            const isAvailable = food.isAvailable !== false;
            return (
              <div key={food._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start space-x-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${food.isVegetarian ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {food.isVegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{food.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{food.description}</p>
                    <p className="text-sm font-black text-slate-900 pt-1">₹{food.price}</p>
                  </div>

                  <button onClick={() => handleDelete(food._id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <button
                    onClick={() => handleToggleAvailability(food._id, isAvailable)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      isAvailable
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isAvailable ? 'In Stock (Click to Disable)' : 'Disabled (Click to Enable)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Menu Dish">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Dish Name</label>
            <input
              type="text"
              required
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Description</label>
            <textarea
              required
              rows={2}
              value={newFood.description}
              onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Price (₹)</label>
              <input
                type="number"
                required
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Type</label>
              <select
                value={newFood.isVegetarian}
                onChange={(e) => setNewFood({ ...newFood, isVegetarian: e.target.value === 'true' })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              >
                <option value="true">Vegetarian</option>
                <option value="false">Non-Vegetarian</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-700"
          >
            Save Dish
          </button>
        </form>
      </Modal>
    </div>
  );
}
