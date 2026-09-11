import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Login thunk
export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const res = await authService.login(credentials);
    // Backend returns: { success: true, data: { user, token, redirectPath } }
    const { user, token } = res.data.data;
    localStorage.setItem('foodrush_token', token);
    localStorage.setItem('foodrush_user', JSON.stringify(user));
    return { user, token };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// Register thunk
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await authService.register(userData);
    const { user, token } = res.data.data;
    localStorage.setItem('foodrush_token', token);
    localStorage.setItem('foodrush_user', JSON.stringify(user));
    return { user, token };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// Fetch current user from token (called on app load)
export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    const res = await authService.getMe();
    // Backend returns: { success: true, data: { _id, name, email, role, ... } }
    const user = res.data.data;
    localStorage.setItem('foodrush_user', JSON.stringify(user));
    return user;
  } catch (err) {
    localStorage.removeItem('foodrush_token');
    localStorage.removeItem('foodrush_user');
    return thunkAPI.rejectWithValue(err.message);
  }
});

const initialState = {
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('foodrush_user')) || null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('foodrush_token') || null,
  isAuthenticated: !!localStorage.getItem('foodrush_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('foodrush_token');
      localStorage.removeItem('foodrush_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    // Sync local user state after profile updates
    updateUserLocal: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('foodrush_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, updateUserLocal } = authSlice.actions;
export default authSlice.reducer;
