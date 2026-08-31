import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await orderService.getOrders();
    return res.data?.data || res.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchOrderDetails = createAsyncThunk('order/fetchDetails', async (id, thunkAPI) => {
  try {
    const res = await orderService.getOrderDetails(id);
    return res.data?.data || res.data;
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
    updateLiveOrderStatus: (state, action) => {
      const updated = action.payload;
      if (!updated) return;

      const isMatch = (target, cand) => {
        if (!target || !cand) return false;
        const tId = String(target._id || '').toLowerCase();
        const tOrdId = String(target.orderId || '').toLowerCase().replace(/^#/, '');
        const cId = String(cand._id || '').toLowerCase();
        const cOrdId = String(cand.orderId || '').toLowerCase().replace(/^#/, '');
        return (
          target._id === cand._id ||
          target.orderId === cand.orderId ||
          (tId && (tId === cId || tId === cOrdId)) ||
          (tOrdId && (tOrdId === cId || tOrdId === cOrdId))
        );
      };

      if (state.currentOrder && isMatch(state.currentOrder, updated)) {
        state.currentOrder = {
          ...state.currentOrder,
          ...updated,
          orderStatus: updated.orderStatus,
        };
      }
      if (Array.isArray(state.orders)) {
        const index = state.orders.findIndex((o) => isMatch(o, updated));
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updated };
        } else {
          state.orders.unshift(updated);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
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
