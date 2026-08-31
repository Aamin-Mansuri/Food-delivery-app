import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../../services/restaurantService';

export const fetchRestaurants = createAsyncThunk('restaurant/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await restaurantService.getRestaurants(params);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchRestaurantDetails = createAsyncThunk('restaurant/fetchDetails', async (id, thunkAPI) => {
  try {
    const res = await restaurantService.getRestaurantDetails(id);
    return res.data;
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRestaurantDetails.pending, (state) => {
        state.loading = true;
      })
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

export default restaurantSlice.reducer;
