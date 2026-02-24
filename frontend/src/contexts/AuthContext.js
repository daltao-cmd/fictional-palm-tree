import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { authAPI.me().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false)); }
    else { setLoading(false); }
  }, []);
  const login = async (credentials) => { const { user, token } = await authAPI.login(credentials); localStorage.setItem('token', token); setUser(user); return user; };
  const register = async (data) => { const { user, token } = await authAPI.register(data); localStorage.setItem('token', token); setUser(user); return user; };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
