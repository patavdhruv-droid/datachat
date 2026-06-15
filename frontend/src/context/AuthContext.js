import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('datachat_token');
    const storedUser = localStorage.getItem('datachat_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token with backend
        getMe().then((res) => {
          setUser(res.data);
          localStorage.setItem('datachat_user', JSON.stringify(res.data));
        }).catch(() => {
          logout();
        });
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('datachat_token', token);
    localStorage.setItem('datachat_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('datachat_token');
    localStorage.removeItem('datachat_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);