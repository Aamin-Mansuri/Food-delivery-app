import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from '../../services/couponService';

export const fetchCoupons = createAsyncThunk('coupon/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await couponService.getCoupons();
    // Backend: { success: true, data: [...coupons] }
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    coupons: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => { state.loading = true; })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state) => { state.loading = false; });
  },
});

export default couponSlice.reducer;
