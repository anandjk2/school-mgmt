import API_BASE, { apiFetch } from './config.js';
const BASE = `${API_BASE}/api/v1/assignments`;

export const createAssignment = async (data) => {
  const r = await apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to assign student');
  return j.data;
};

export const bulkAssign = async (assignments) => {
  const r = await apiFetch(`${BASE}/bulk`, { method: 'POST', body: JSON.stringify({ assignments }) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to bulk assign');
  return j.data;
};

export const disenrollAssignment = async (id) => {
  const r = await apiFetch(`${BASE}/${id}/disenroll`, { method: 'PUT' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to disenroll');
  return j.data;
};

export const reenrollAssignment = async (id) => {
  const r = await apiFetch(`${BASE}/${id}/reenroll`, { method: 'PUT' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to re-enroll');
  return j.data;
};

export const deleteAssignment = async (id) => {
  const r = await apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) { const j = await r.json(); throw new Error(j.error?.message || 'Failed to remove assignment'); }
};
