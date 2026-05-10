import { apiFetch } from './config.js';

export const login = async (email, password) => {
  const r = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Login failed');
  return j.data;
};

export const getMe = async () => {
  const r = await apiFetch('/api/v1/auth/me');
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Auth check failed');
  return j;
};
