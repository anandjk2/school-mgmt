import API_BASE from './config.js';
const BASE = `${API_BASE}/api/v1/assignments`;

export const createAssignment = async (data) => {
  const r = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to assign student');
  return j.data;
};

export const bulkAssign = async (assignments) => {
  const r = await fetch(`${BASE}/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to bulk assign');
  return j.data;
};

export const disenrollAssignment = async (id) => {
  const r = await fetch(`${BASE}/${id}/disenroll`, { method: 'PUT' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to disenroll');
  return j.data;
};

export const reenrollAssignment = async (id) => {
  const r = await fetch(`${BASE}/${id}/reenroll`, { method: 'PUT' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to re-enroll');
  return j.data;
};

export const deleteAssignment = async (id) => {
  const r = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) { const j = await r.json(); throw new Error(j.error?.message || 'Failed to remove assignment'); }
};
