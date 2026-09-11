import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/addressService';

export const fetchAddresses = createAsyncThunk('address/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await addressService.getAddresses();
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;
