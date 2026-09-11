import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { foodService } from '../../services/foodService';

// Fetch all foods (optionally filtered by restaurant, category, etc.)
export const fetchFoods = createAsyncThunk('food/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await foodService.getFoods(params);
    // Backend: { success: true, count: N, data: [...foods] }
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const foodSlice = createSlice({
  name: 'food',
  initialState: {
    foods: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default foodSlice.reducer;
