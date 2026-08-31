import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../services/favoriteService';

export const fetchFavorites = createAsyncThunk('favorite/fetchAll', async () => {
  const res = await favoriteService.getFavorites();
  return res.data;
});

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: { restaurants: [], foods: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.restaurants = action.payload.restaurants || [];
      state.foods = action.payload.foods || [];
    });
  },
});

export default favoriteSlice.reducer;
