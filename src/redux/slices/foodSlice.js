import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { foodService } from '../../services/foodService';

export const fetchFoods = createAsyncThunk('food/fetchAll', async (params, thunkAPI) => {
  try {
    const res = await foodService.getFoods(params);
    return res.data;
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
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
      })
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
