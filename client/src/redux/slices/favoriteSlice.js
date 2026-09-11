import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../services/favoriteService';

export const fetchFavorites = createAsyncThunk('favorite/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await favoriteService.getFavorites();
    // Backend: { success: true, data: { restaurants: [...], foods: [...] } }
    return res.data.data || { restaurants: [], foods: [] };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {
    restaurants: [],
    foods: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => { state.loading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.restaurants || [];
        state.foods = action.payload.foods || [];
      })
      .addCase(fetchFavorites.rejected, (state) => { state.loading = false; });
  },
});

export default favoriteSlice.reducer;
