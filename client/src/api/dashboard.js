import API_BASE from './config.js';

export const fetchDashboard = async () => {
  const r = await fetch(`${API_BASE}/api/v1/dashboard`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch dashboard');
  return j.data;
};
