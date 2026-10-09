import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

// Fetch all orders for the logged-in user (role-filtered on the backend)
export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await orderService.getOrders();
    // Backend: { success: true, count: N, data: [...orders] }
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// Fetch a single order's full details
export const fetchOrderDetails = createAsyncThunk('order/fetchDetails', async (id, thunkAPI) => {
  try {
    const res = await orderService.getOrderDetails(id);
    // Backend: { success: true, data: { ...order } }
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Called by the Socket.IO hook when a live order status change comes in
    updateLiveOrderStatus: (state, action) => {
      const updated = action.payload;
      if (!updated) return;

      // Match by _id or orderId
      const isSameOrder = (a, b) =>
        a && b && (String(a._id) === String(b._id) || String(a.orderId) === String(b.orderId));

      if (state.currentOrder && isSameOrder(state.currentOrder, updated)) {
        state.currentOrder = { ...state.currentOrder, ...updated };
      }

      const idx = state.orders.findIndex((o) => isSameOrder(o, updated));
      if (idx !== -1) {
        state.orders[idx] = { ...state.orders[idx], ...updated };
      } else {
        state.orders.unshift(updated);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateLiveOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
