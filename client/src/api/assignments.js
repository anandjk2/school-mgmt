import { supabase } from '../lib/supabase.js';

export const createAssignment = async (body) => {
  const { data, error } = await supabase.from('student_classes').insert(body).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const bulkAssign = async (assignments) => {
  const { data, error } = await supabase.from('student_classes').insert(assignments).select();
  if (error) throw new Error(error.message);
  return data;
};

export const disenrollAssignment = async (id) => {
  const { data, error } = await supabase
    .from('student_classes')
    .update({ disenrolled_on: new Date().toISOString().split('T')[0] })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const reenrollAssignment = async (id) => {
  const { data, error } = await supabase
    .from('student_classes')
    .update({ disenrolled_on: null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteAssignment = async (id) => {
  const { error } = await supabase.from('student_classes').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
