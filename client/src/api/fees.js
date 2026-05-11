import { supabase } from '../lib/supabase.js';

export const fetchFees = async (params = {}) => {
  let q = supabase.from('fees').select('*, students(first_name, last_name), classes(name)', { count: 'exact' });
  if (params.student_id) q = q.eq('student_id', params.student_id);
  if (params.status) q = q.eq('status', params.status);
  if (params.class_id) q = q.eq('class_id', params.class_id);
  q = q.order('due_date', { ascending: false });
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { data, total: count };
};

export const fetchFee = async (id) => {
  const { data, error } = await supabase
    .from('fees')
    .select('*, students(first_name, last_name), classes(name)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const fetchFeesSummary = async (params = {}) => {
  let q = supabase.from('fees').select('amount_due, amount_paid, status');
  if (params.student_id) q = q.eq('student_id', params.student_id);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return {
    total_due: data.reduce((s, r) => s + Number(r.amount_due), 0),
    total_paid: data.reduce((s, r) => s + Number(r.amount_paid), 0),
    pending_count: data.filter(r => r.status === 'pending').length,
    paid_count: data.filter(r => r.status === 'paid').length,
  };
};

export const createFee = async (body) => {
  const { data, error } = await supabase.from('fees').insert(body).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateFee = async (id, body) => {
  const { data, error } = await supabase
    .from('fees')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteFee = async (id) => {
  const { error } = await supabase.from('fees').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
