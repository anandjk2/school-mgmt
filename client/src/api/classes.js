import { supabase } from '../lib/supabase.js';

export const fetchClasses = async (params = {}) => {
  let q = supabase.from('classes').select('*', { count: 'exact' });
  if (params.search) q = q.ilike('name', `%${params.search}%`);
  if (params.academic_year) q = q.eq('academic_year', params.academic_year);
  q = q.order('name');
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { data, total: count };
};

export const fetchClass = async (id) => {
  const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const createClass = async (body) => {
  const { data, error } = await supabase.from('classes').insert(body).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateClass = async (id, body) => {
  const { data, error } = await supabase
    .from('classes')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteClass = async (id) => {
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const fetchClassStudents = async (id, params = {}) => {
  let q = supabase.from('student_classes').select('*, students(*)').eq('class_id', id);
  if (!params.include_disenrolled) q = q.is('disenrolled_on', null);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
};
