import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await notificationService.getNotifications();
    // Backend: { success: true, data: [...notifications] }
    return res.data.data || [];
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    // Add a new live notification from Socket.IO
    addLiveNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    // Mark all as read locally
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    });
  },
});

export const { addLiveNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
