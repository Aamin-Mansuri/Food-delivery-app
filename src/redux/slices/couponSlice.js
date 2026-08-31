import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from '../../services/couponService';

export const fetchCoupons = createAsyncThunk('coupon/fetchAll', async () => {
  const res = await couponService.getCoupons();
  return res.data;
});

const couponSlice = createSlice({
  name: 'coupon',
  initialState: { coupons: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCoupons.fulfilled, (state, action) => {
      state.coupons = action.payload;
    });
  },
});

export default couponSlice.reducer;
