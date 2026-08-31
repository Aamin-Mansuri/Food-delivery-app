import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { fetchMe, logout as logoutReduxAction, updateUserLocal } from '../redux/slices/authSlice';

export const AuthContext = createContext(null);

export const ROLE_PERMISSIONS = {
  customer: {
    name: 'Customer',
    defaultRoute: '/',
    allowedPrefixes: ['/', '/restaurants', '/restaurant', '/food', '/search', '/cart', '/checkout', '/orders', '/favorites', '/addresses', '/profile', '/notifications'],
  },
  restaurant_owner: {
    name: 'Restaurant Owner',
    defaultRoute: '/restaurant/dashboard',
    allowedPrefixes: ['/restaurant'],
  },
  delivery_partner: {
    name: 'Delivery Partner',
    defaultRoute: '/delivery/dashboard',
    allowedPrefixes: ['/delivery'],
  },
  admin: {
    name: 'Platform Admin',
    defaultRoute: '/admin/dashboard',
    allowedPrefixes: ['/admin'],
  },
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('foodrush_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('foodrush_token') || null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with localStorage and Redux if present
  useEffect(() => {
    if (reduxAuth?.user && (!user || reduxAuth.user._id !== user._id || reduxAuth.user.role !== user.role)) {
      setUser(reduxAuth.user);
    }
    if (reduxAuth?.token && reduxAuth.token !== token) {
      setToken(reduxAuth.token);
    }
  }, [reduxAuth, user, token]);

  // Initial session recovery from token
  const checkAuthSession = useCallback(async () => {
    const storedToken = localStorage.getItem('foodrush_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setInitialChecking(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res && res.data) {
        setUser(res.data);
        setToken(storedToken);
        localStorage.setItem('foodrush_user', JSON.stringify(res.data));
        dispatch(fetchMe());
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid:', err.message);
      localStorage.removeItem('foodrush_token');
      localStorage.removeItem('foodrush_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
      setInitialChecking(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  // Login handler with role validation
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login(credentials);
      const { user: loggedInUser, token: authToken } = res.data;

      if (!loggedInUser || !authToken) {
        throw new Error('Invalid authentication response from server.');
      }

      localStorage.setItem('foodrush_token', authToken);
      localStorage.setItem('foodrush_user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setToken(authToken);

      // Trigger Redux sync
      dispatch({
        type: 'auth/login/fulfilled',
        payload: { user: loggedInUser, token: authToken },
      });

      return { success: true, user: loggedInUser, token: authToken };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please verify credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Register handler
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.register(userData);
      const { user: registeredUser, token: authToken } = res.data;

      localStorage.setItem('foodrush_token', authToken);
      localStorage.setItem('foodrush_user', JSON.stringify(registeredUser));

      setUser(registeredUser);
      setToken(authToken);

      dispatch({
        type: 'auth/register/fulfilled',
        payload: { user: registeredUser, token: authToken },
      });

      return { success: true, user: registeredUser, token: authToken };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('foodrush_token');
    localStorage.removeItem('foodrush_user');
    setUser(null);
    setToken(null);
    setError(null);
    dispatch(logoutReduxAction());
  }, [dispatch]);

  // Update profile handler
  const updateProfile = useCallback(async (formData) => {
    try {
      setLoading(true);
      const res = await authService.updateProfile(formData);
      const updatedUser = res.data.user || res.data;

      setUser(updatedUser);
      localStorage.setItem('foodrush_user', JSON.stringify(updatedUser));
      dispatch(updateUserLocal(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update failed.';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Role verification helper
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  // Role-based redirect helper
  const getRoleDashboardRoute = useCallback(() => {
    if (!user) return '/login';
    switch (user.role) {
      case 'restaurant_owner':
        return '/restaurant/dashboard';
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'customer':
      default:
        return '/';
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading: loading || initialChecking,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    getRoleDashboardRoute,
    checkAuthSession,
    clearError: () => setError(null),
  }), [user, token, loading, initialChecking, error, login, register, logout, updateProfile, hasRole, getRoleDashboardRoute, checkAuthSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
