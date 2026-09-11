import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { fetchMe, logout as logoutAction, updateUserLocal } from '../redux/slices/authSlice';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('foodrush_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('foodrush_token') || null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [error, setError] = useState(null);

  // Keep local state in sync with Redux
  useEffect(() => {
    if (reduxAuth?.user) setUser(reduxAuth.user);
    if (reduxAuth?.token) setToken(reduxAuth.token);
  }, [reduxAuth]);

  // On mount, verify the stored token is still valid
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
      // Backend: { success: true, data: { _id, name, email, role, ... } }
      const userData = res.data.data;
      setUser(userData);
      setToken(storedToken);
      localStorage.setItem('foodrush_user', JSON.stringify(userData));
      dispatch(fetchMe());
    } catch (err) {
      console.warn('[AuthContext] Session invalid:', err.message);
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

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login(credentials);
      // Backend: { success: true, data: { user, token, redirectPath } }
      const { user: loggedInUser, token: authToken } = res.data.data;

      localStorage.setItem('foodrush_token', authToken);
      localStorage.setItem('foodrush_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setToken(authToken);

      return { success: true, user: loggedInUser, token: authToken };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.register(userData);
      const { user: newUser, token: authToken } = res.data.data;

      localStorage.setItem('foodrush_token', authToken);
      localStorage.setItem('foodrush_user', JSON.stringify(newUser));
      setUser(newUser);
      setToken(authToken);

      return { success: true, user: newUser, token: authToken };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('foodrush_token');
    localStorage.removeItem('foodrush_user');
    setUser(null);
    setToken(null);
    setError(null);
    dispatch(logoutAction());
  }, [dispatch]);

  const updateProfile = useCallback(async (formData) => {
    try {
      setLoading(true);
      const res = await authService.updateProfile(formData);
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('foodrush_user', JSON.stringify(updatedUser));
      dispatch(updateUserLocal(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      throw new Error(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  const getRoleDashboardRoute = useCallback(() => {
    if (!user) return '/login';
    switch (user.role) {
      case 'restaurant_owner': return '/restaurant/dashboard';
      case 'delivery_partner': return '/delivery/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
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
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
