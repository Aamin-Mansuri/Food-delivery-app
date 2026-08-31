import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async () => {
  const res = await notificationService.getNotifications();
  return res.data;
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { notifications: [] },
  reducers: {
    addLiveNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
    });
  },
});

export const { addLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
