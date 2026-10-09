import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../../services/restaurantService';

// Fetch all restaurants (optionally with query filters)
export const fetchRestaurants = createAsyncThunk('restaurant/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await restaurantService.getRestaurants(params);
    // Backend: { success: true, count: N, data: [...restaurants] }
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// Fetch details of a single restaurant by ID
export const fetchRestaurantDetails = createAsyncThunk('restaurant/fetchDetails', async (id, thunkAPI) => {
  try {
    const res = await restaurantService.getRestaurantDetails(id);
    // Backend: { success: true, data: { ...restaurant, foods, reviews } }
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRestaurantDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(fetchRestaurantDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
