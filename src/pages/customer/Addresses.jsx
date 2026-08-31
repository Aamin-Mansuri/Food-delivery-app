import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Modal from '../../components/common/Modal';
import { addressService } from '../../services/addressService';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ title: 'Home', street: '', area: '', city: 'Mumbai', pincode: '' });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    addressService.getAddresses().then((res) => {
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setAddresses(list);
      }
    }).catch((err) => {
      console.warn('Failed to load addresses:', err);
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addressService.createAddress(newAddr);
      setIsModalOpen(false);
      setNewAddr({ title: 'Home', street: '', area: '', city: 'Mumbai', pincode: '' });
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressService.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Saved Delivery Addresses</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your delivery locations</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-orange-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded">
                  {addr.title}
                </span>
                <p className="text-xs font-bold text-slate-900 pt-1">{addr.street}</p>
                <p className="text-xs text-slate-500">{addr.area}, {addr.city} - {addr.pincode}</p>
              </div>

              <button
                onClick={() => handleDelete(addr._id)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Address Tag</label>
            <input
              type="text"
              required
              value={newAddr.title}
              onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
              placeholder="Home / Work / Gym"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700">Flat / House / Street</label>
            <input
              type="text"
              required
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Area</label>
              <input
                type="text"
                required
                value={newAddr.area}
                onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700">Pincode</label>
              <input
                type="text"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-orange-700"
          >
            Save Address
          </button>
        </form>
      </Modal>
    </div>
  );
}
