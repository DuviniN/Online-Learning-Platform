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

  // Registration does not log the user in — it only creates the account.
  // The user then logs in explicitly from the login page with their new
  // credentials, so no token/user is stored here.
  const register = async (name, email, password, role, instructorCode) => {
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      // Only sent when registering as an instructor — the backend validates
      // it against a server-side secret and is the sole authority on the role.
      if (role === 'instructor') payload.instructorCode = instructorCode;
      const { data } = await axiosClient.post('/auth/register', payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Merges fresh fields (e.g. after a profile save) into the stored user so
  // the navbar and any other consumer reflect the change immediately.
  const updateUser = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
