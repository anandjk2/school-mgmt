import API_BASE, { apiFetch } from './config.js';
const BASE = `${API_BASE}/api/v1/attendance`;

export const fetchAttendance = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await apiFetch(`${BASE}?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch attendance');
  return j.data;
};

export const fetchAttendanceSummary = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await apiFetch(`${BASE}/summary?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch summary');
  return j.data;
};

export const bulkUpsertAttendance = async (data) => {
  const r = await apiFetch(`${BASE}/bulk`, { method: 'POST', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to save attendance');
  return j.data;
};

export const updateAttendance = async (id, data) => {
  const r = await apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to update');
  return j.data;
};
