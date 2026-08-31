import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/addressService';

export const fetchAddresses = createAsyncThunk('address/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await addressService.getAddresses();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAddresses.fulfilled, (state, action) => {
      state.addresses = action.payload;
    });
  },
});

export default addressSlice.reducer;
