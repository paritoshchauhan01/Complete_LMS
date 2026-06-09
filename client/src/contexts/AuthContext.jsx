import { createContext, useContext, useState, useEffect } from 'react';
import api, { waitForApiBaseURL } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    checkAuth();
    const fallback = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(fallback);
  }, []);

  const checkAuth = async () => {
    try {
      await waitForApiBaseURL();
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Always fetch fresh profile from DB — role may have changed
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('[Auth] Profile fetch failed:', error?.message);
          setApiError(error?.message || 'Failed to fetch profile');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('[Auth] Initialization failed:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Called by AuthCallbackPage after Google OAuth redirect.
   * Stores JWT and fetches fresh profile (with correct role) from DB.
   */
  const loginWithToken = async (token) => {
    localStorage.setItem('token', token);
    await waitForApiBaseURL();
    const response = await api.get('/auth/profile');
    const freshUser = response.data.user;
    setUser(freshUser);
    return freshUser; // caller uses role for redirect
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Refresh user profile from DB (useful after role changes)
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('[Auth] Refresh failed:', error?.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, refreshUser, apiError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
