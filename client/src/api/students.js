import { supabase } from '../lib/supabase.js';

export const fetchStudents = async (params = {}) => {
  let q = supabase.from('students').select('*', { count: 'exact' });
  if (params.search) q = q.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
  if (params.status) q = q.eq('status', params.status);
  q = q.order('last_name').order('first_name');
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { data, total: count };
};

export const fetchStudent = async (id) => {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const createStudent = async (body) => {
  const { data, error } = await supabase.from('students').insert(body).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateStudent = async (id, body) => {
  const { data, error } = await supabase
    .from('students')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteStudent = async (id) => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const fetchStudentFees = async (id, params = {}) => {
  let q = supabase.from('fees').select('*, classes(name)').eq('student_id', id);
  if (params.status) q = q.eq('status', params.status);
  const { data, error } = await q.order('due_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const fetchStudentAttendance = async (id, params = {}) => {
  let q = supabase.from('attendance').select('*, classes(name)').eq('student_id', id);
  if (params.class_id) q = q.eq('class_id', params.class_id);
  if (params.from) q = q.gte('date', params.from);
  if (params.to) q = q.lte('date', params.to);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};
