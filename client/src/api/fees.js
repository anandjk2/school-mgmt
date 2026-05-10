import API_BASE, { apiFetch } from './config.js';
const BASE = `${API_BASE}/api/v1/fees`;

export const fetchFees = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await apiFetch(`${BASE}?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch fees');
  return j;
};

export const fetchFee = async (id) => {
  const r = await apiFetch(`${BASE}/${id}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Fee not found');
  return j.data;
};

export const fetchFeesSummary = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await apiFetch(`${BASE}/summary?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch summary');
  return j.data;
};

export const createFee = async (data) => {
  const r = await apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to create fee');
  return j.data;
};

export const updateFee = async (id, data) => {
  const r = await apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to update fee');
  return j.data;
};

export const deleteFee = async (id) => {
  const r = await apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) { const j = await r.json(); throw new Error(j.error?.message || 'Failed to delete fee'); }
};
