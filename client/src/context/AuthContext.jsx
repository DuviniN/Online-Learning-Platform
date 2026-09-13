import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, instructorCode) => {
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      // Only sent when registering as an instructor — the backend validates
      // it against a server-side secret and is the sole authority on the role.
      if (role === 'instructor') payload.instructorCode = instructorCode;
      const { data } = await axiosClient.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
