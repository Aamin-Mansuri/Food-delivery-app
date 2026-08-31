import { storeService } from '../services/storeService.js';
import { uploadToCloudinaryMock } from '../config/cloudinary.js';

export const getRestaurants = async (req, res) => {
  try {
    const restaurants = storeService.getRestaurants(req.query);
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantDetails = async (req, res) => {
  try {
    const restaurant = storeService.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    const foods = storeService.getFoods({ restaurantId: restaurant._id });
    const reviews = storeService.getReviewsByRestaurant(restaurant._id);

    res.json({
      success: true,
      data: {
        ...restaurant,
        foods,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const { name, description, phone, email, address, city, pincode, cuisineTypes, minimumOrder, deliveryFee } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    const newRestaurant = storeService.createRestaurant({
      name,
      slug,
      description,
      owner: req.user._id,
      phone,
      email,
      address,
      city: city || 'Mumbai',
      pincode,
      cuisineTypes: Array.isArray(cuisineTypes) ? cuisineTypes : (cuisineTypes || '').split(',').map((c) => c.trim()),
      minimumOrder: Number(minimumOrder) || 150,
      deliveryFee: Number(deliveryFee) || 40,
    });

    res.status(201).json({ success: true, message: 'Restaurant created successfully', data: newRestaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = storeService.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (restaurant.owner !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }

    const updated = storeService.updateRestaurant(restaurant._id, req.body);
    res.json({ success: true, message: 'Restaurant updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRestaurantOpen = async (req, res) => {
  try {
    const restaurant = storeService.getRestaurantById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const updated = storeService.updateRestaurant(restaurant._id, { isOpen: !restaurant.isOpen });
    res.json({ success: true, message: `Restaurant status set to ${updated.isOpen ? 'OPEN' : 'CLOSED'}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
