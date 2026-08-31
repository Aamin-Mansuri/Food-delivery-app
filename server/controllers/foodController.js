import { storeService } from '../services/storeService.js';
import { uploadToCloudinaryMock } from '../config/cloudinary.js';

export const getFoods = async (req, res) => {
  try {
    const foods = storeService.getFoods(req.query);
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFoodDetails = async (req, res) => {
  try {
    const food = storeService.getFoodById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });
    const restaurant = storeService.getRestaurantById(food.restaurant);

    res.json({
      success: true,
      data: {
        ...food,
        restaurantInfo: restaurant,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFood = async (req, res) => {
  try {
    const { name, description, restaurant, category, price, discountPrice, isVegetarian, isVegan, ingredients, preparationTime, image } = req.body;

    let imageUrl = image;
    if (req.file) {
      const uploadRes = await uploadToCloudinaryMock(req.file.buffer, 'foods');
      imageUrl = uploadRes.secure_url;
    }

    const newFood = storeService.createFood({
      name,
      description,
      restaurant,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      image: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients || '').split(',').map((i) => i.trim()),
      isVegetarian: isVegetarian === 'true' || isVegetarian === true,
      isVegan: isVegan === 'true' || isVegan === true,
      preparationTime: preparationTime || '15-20 min',
    });

    res.status(201).json({ success: true, message: 'Food item created successfully', data: newFood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFood = async (req, res) => {
  try {
    const food = storeService.getFoodById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });

    let imageUrl = req.body.image;
    if (req.file) {
      const uploadRes = await uploadToCloudinaryMock(req.file.buffer, 'foods');
      imageUrl = uploadRes.secure_url;
    }

    const updated = storeService.updateFood(food._id, {
      ...req.body,
      ...(imageUrl && { image: imageUrl }),
    });

    res.json({ success: true, message: 'Food item updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFoodAvailability = async (req, res) => {
  try {
    const food = storeService.getFoodById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });

    const newStatus = typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : !food.isAvailable;
    const updated = storeService.updateFood(food._id, { isAvailable: newStatus });

    res.json({
      success: true,
      message: `Menu item '${updated.name}' is now ${updated.isAvailable ? 'In Stock (Available)' : 'Out of Stock (Disabled)'}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const deleted = storeService.deleteFood(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
