import { createContext, useState, useEffect } from 'react';
import api from './api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('streaminUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('streaminUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('streaminUser');
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data);
    return response.data;
  };

  const register = async (details) => {
    const response = await api.post('/auth/register', details);
    if (response.data.requiresVerification) {
      return response.data;
    }

    setUser(response.data);
    return response.data;
  };

  const logout = () => setUser(null);

  const authHeaders = () => {
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};
