import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

export const syncCartWithBackend = createAsyncThunk('cart/sync', async (_, { getState }) => {
  const { cart, auth } = getState();
  if (auth.isAuthenticated && cart.restaurant) {
    try {
      await cartService.syncCart({
        restaurantId: cart.restaurant._id || cart.restaurant,
        items: cart.items.map((i) => ({
          foodId: i.food._id || i.food.id,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    } catch (e) {
      console.warn('Cart backend sync skipped:', e.message);
    }
  }
});

const initialState = {
  restaurant: JSON.parse(localStorage.getItem('foodrush_cart_restaurant')) || null,
  items: JSON.parse(localStorage.getItem('foodrush_cart_items')) || [],
  isDrawerOpen: false,
  notificationMessage: '',
};

const saveCartToStorage = (restaurant, items) => {
  localStorage.setItem('foodrush_cart_restaurant', JSON.stringify(restaurant));
  localStorage.setItem('foodrush_cart_items', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { food, restaurant } = action.payload;
      if (!food) return;

      // Prevent adding unavailable item
      if (food.isAvailable === false) {
        state.notificationMessage = `"${food.name}" is currently sold out.`;
        return;
      }

      const foodId = String(food._id || food.id || food);

      // Resolve full restaurant details
      const restId = String(
        restaurant?._id ||
          restaurant?.id ||
          restaurant ||
          food.restaurant?._id ||
          food.restaurant?.id ||
          food.restaurant ||
          food.restaurantId ||
          'default_kitchen'
      );

      const fullRestaurant = {
        _id: restId,
        name: restaurant?.name || food.restaurant?.name || 'FoodRush Kitchen',
        deliveryFee:
          restaurant?.deliveryFee !== undefined
            ? Number(restaurant.deliveryFee)
            : food.restaurant?.deliveryFee !== undefined
            ? Number(food.restaurant.deliveryFee)
            : 30,
        image: restaurant?.image || food.restaurant?.image || '',
      };

      // Check if cart has items from another restaurant
      const existingRestId = state.restaurant
        ? String(state.restaurant._id || state.restaurant.id || state.restaurant)
        : null;

      if (existingRestId && existingRestId !== restId && state.items.length > 0) {
        state.items = [];
        state.notificationMessage = `Cart cleared! You can only order from one restaurant at a time. Added ${food.name} instead.`;
      } else {
        state.notificationMessage = `Added ${food.name} to your cart!`;
      }

      state.restaurant = fullRestaurant;

      const existingIndex = state.items.findIndex((item) => {
        const itemFoodId = String(item.food?._id || item.food?.id || item.food);
        return itemFoodId === foodId;
      });

      const foodPrice = Number(
        food.discountPrice && food.discountPrice > 0 ? food.discountPrice : food.price || 0
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({
          food: {
            _id: foodId,
            name: food.name || 'Food Item',
            price: Number(food.price || 0),
            discountPrice: Number(food.discountPrice || 0),
            image: food.image || '',
            isVegetarian: food.isVegetarian !== undefined ? food.isVegetarian : true,
            description: food.description || '',
            ...food,
          },
          quantity: 1,
          price: foodPrice,
        });
      }

      saveCartToStorage(state.restaurant, state.items);
    },
    removeFromCart: (state, action) => {
      const targetId = String(action.payload);
      state.items = state.items.filter((item) => {
        const itemFoodId = String(item.food?._id || item.food?.id || item.food);
        return itemFoodId !== targetId;
      });

      if (state.items.length === 0) {
        state.restaurant = null;
      }
      saveCartToStorage(state.restaurant, state.items);
    },
    updateQuantity: (state, action) => {
      const { foodId, quantity } = action.payload;
      const targetId = String(foodId);

      if (quantity <= 0) {
        state.items = state.items.filter((item) => {
          const itemFoodId = String(item.food?._id || item.food?.id || item.food);
          return itemFoodId !== targetId;
        });
      } else {
        const item = state.items.find((i) => {
          const itemFoodId = String(i.food?._id || i.food?.id || i.food);
          return itemFoodId === targetId;
        });
        if (item) item.quantity = quantity;
      }

      if (state.items.length === 0) {
        state.restaurant = null;
      }
      saveCartToStorage(state.restaurant, state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      saveCartToStorage(null, []);
    },
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
    clearNotificationMessage: (state) => {
      state.notificationMessage = '';
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCartDrawer,
  clearNotificationMessage,
} = cartSlice.actions;

export default cartSlice.reducer;

