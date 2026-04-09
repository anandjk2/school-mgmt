import API_BASE from './config.js';
const BASE = `${API_BASE}/api/v1/classes`;

export const fetchClasses = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await fetch(`${BASE}?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch classes');
  return j;
};

export const fetchClass = async (id) => {
  const r = await fetch(`${BASE}/${id}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Class not found');
  return j.data;
};

export const createClass = async (data) => {
  const r = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to create class');
  return j.data;
};

export const updateClass = async (id, data) => {
  const r = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to update class');
  return j.data;
};

export const deleteClass = async (id) => {
  const r = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) { const j = await r.json(); throw new Error(j.error?.message || 'Failed to delete class'); }
};

export const fetchClassStudents = async (id, params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
  const r = await fetch(`${BASE}/${id}/students?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch students');
  return j.data;
};
