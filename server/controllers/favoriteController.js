import { storeService } from '../services/storeService.js';

export const toggleFavoriteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const user = storeService.findUserById(req.user._id);
    let favorites = [...(user.favoriteRestaurants || [])];

    if (favorites.includes(restaurantId)) {
      favorites = favorites.filter((id) => id !== restaurantId);
    } else {
      favorites.push(restaurantId);
    }

    storeService.updateUser(user._id, { favoriteRestaurants: favorites });
    res.json({ success: true, message: 'Favorites updated', data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavoriteFood = async (req, res) => {
  try {
    const { foodId } = req.body;
    const user = storeService.findUserById(req.user._id);
    let favorites = [...(user.favoriteFoods || [])];

    if (favorites.includes(foodId)) {
      favorites = favorites.filter((id) => id !== foodId);
    } else {
      favorites.push(foodId);
    }

    storeService.updateUser(user._id, { favoriteFoods: favorites });
    res.json({ success: true, message: 'Favorites updated', data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = storeService.findUserById(req.user._id);
    const favoriteRestaurants = (user.favoriteRestaurants || []).map((id) => storeService.getRestaurantById(id)).filter(Boolean);
    const favoriteFoods = (user.favoriteFoods || []).map((id) => storeService.getFoodById(id)).filter(Boolean);

    res.json({
      success: true,
      data: {
        restaurants: favoriteRestaurants,
        foods: favoriteFoods,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
