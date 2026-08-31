import React, { useEffect, useState } from 'react';
import API from '../../services/api';

export default function RestaurantCategories() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    API.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await API.post('/categories', { name: newCat });
    setCategories([...categories, res.data]);
    setNewCat('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Food Categories</h1>
        <p className="text-xs text-slate-500 font-medium">Organize menu items by course category</p>
      </div>

      <form onSubmit={handleAdd} className="flex space-x-2 max-w-md">
        <input
          type="text"
          required
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New Category (e.g. Starters)"
          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
        />
        <button type="submit" className="bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs">
          Add
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs font-bold text-slate-800 text-sm text-center">
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
