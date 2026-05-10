import API_BASE, { apiFetch } from './config.js';

export const fetchDashboard = async () => {
  const r = await apiFetch(`${API_BASE}/api/v1/dashboard`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch dashboard');
  return j.data;
};
