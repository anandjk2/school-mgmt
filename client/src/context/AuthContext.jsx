import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data } = await supabase
    .from('users')
    .select('*, tenants(name)')
    .eq('auth_id', userId)
    .single();
  return data;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await loadProfile(session.user.id);
        if (profile) {
          setAuth({
            user: profile,
            tenantId: profile.tenant_id,
            tenantName: profile.tenants?.name,
          });
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        qc.clear();
        setAuth(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = await loadProfile(data.user.id);
    if (!profile) throw new Error('User profile not found. Contact your administrator.');
    const authState = {
      user: profile,
      tenantId: profile.tenant_id,
      tenantName: profile.tenants?.name,
    };
    setAuth(authState);
    return { user: profile };
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
