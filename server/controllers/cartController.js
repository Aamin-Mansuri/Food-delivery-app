import { storeService } from '../services/storeService.js';

export const getCart = async (req, res) => {
  try {
    const cart = storeService.getCart(req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;
    if (!restaurantId || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid cart payload' });
    }

    const updatedCart = storeService.updateCart(req.user._id, { restaurantId, items });
    res.json({ success: true, message: 'Cart updated', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cleared = storeService.clearCart(req.user._id);
    res.json({ success: true, message: 'Cart cleared', data: cleared });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
