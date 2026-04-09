import API_BASE from './config.js';
const BASE = `${API_BASE}/api/v1/students`;

export const fetchStudents = async (params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await fetch(`${BASE}?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch students');
  return j;
};

export const fetchStudent = async (id) => {
  const r = await fetch(`${BASE}/${id}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Student not found');
  return j.data;
};

export const createStudent = async (data) => {
  const r = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to create student');
  return j.data;
};

export const updateStudent = async (id, data) => {
  const r = await fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to update student');
  return j.data;
};

export const deleteStudent = async (id) => {
  const r = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!r.ok) { const j = await r.json(); throw new Error(j.error?.message || 'Failed to delete student'); }
};

export const fetchStudentFees = async (id, params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await fetch(`${BASE}/${id}/fees?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch fees');
  return j.data;
};

export const fetchStudentAttendance = async (id, params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const r = await fetch(`${BASE}/${id}/attendance?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Failed to fetch attendance');
  return j.data;
};
