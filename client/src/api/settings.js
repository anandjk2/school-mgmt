import API_BASE, { apiFetch } from './config.js';
const BASE = `${API_BASE}/api/v1/settings`;

export const fetchSettings = async () => {
  const r = await apiFetch(BASE);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch settings');
  return j.data;
};

export const updateSettings = async (data) => {
  const r = await apiFetch(BASE, { method: 'PUT', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to save settings');
  return j.data;
};
