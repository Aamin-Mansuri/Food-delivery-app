import { storeService } from '../services/storeService.js';

export const getCategories = async (req, res) => {
  try {
    const categories = storeService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, image } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const newCat = storeService.createCategory({ name, icon, image });
    res.status(201).json({ success: true, message: 'Category created', data: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
