import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, getMe } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(({ data }) => {
        setAuth({ token, user: data, tenantId: data.tenant_id, tenantName: data.tenantName });
      })
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('auth_token', data.token);
    setAuth({ token: data.token, user: data.user, tenantId: data.tenantId, tenantName: data.tenantName });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    qc.clear();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
