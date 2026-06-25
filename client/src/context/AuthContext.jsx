import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = async (email, name) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/callback', { email, name });
      
      // Store access token in sessionStorage (not localStorage for security)
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', err);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      // Token expired or invalid
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleOAuthSuccess = (token, userData) => {
    sessionStorage.setItem('accessToken', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, fetchMe, handleOAuthSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
