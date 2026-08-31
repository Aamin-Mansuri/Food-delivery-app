import { storeService } from '../services/storeService.js';

export const getAddresses = async (req, res) => {
  try {
    const addresses = storeService.getAddresses(req.user._id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const { fullName, phone, house, street, area, city, pincode, landmark, type, title, isDefault } = req.body;
    
    // Fallback defaults so users can add address easily
    const resolvedStreet = street || house || area || '';
    const resolvedArea = area || street || '';
    const resolvedCity = city || 'Mumbai';
    const resolvedPincode = pincode || '400001';

    if (!resolvedStreet && !resolvedArea) {
      return res.status(400).json({ success: false, message: 'Please provide street or area address details' });
    }

    const newAddr = storeService.createAddress(req.user._id, {
      fullName: fullName || req.user.name || 'FoodRush Customer',
      phone: phone || req.user.phone || '+91 9876543210',
      house: house || resolvedStreet,
      street: resolvedStreet,
      area: resolvedArea,
      city: resolvedCity,
      pincode: resolvedPincode,
      landmark: landmark || '',
      type: type || title || 'Home',
      title: title || type || 'Home',
      isDefault: !!isDefault,
    });

    res.status(201).json({ success: true, message: 'Address added successfully', data: newAddr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const updated = storeService.updateAddress(req.params.id, req.user._id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, message: 'Address updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const deleted = storeService.deleteAddress(req.params.id, req.user._id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
