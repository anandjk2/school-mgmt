import { supabase } from '../lib/supabase.js';

export const fetchAttendance = async (params = {}) => {
  let q = supabase.from('attendance').select('*, students(first_name, last_name), classes(name)');
  if (params.class_id) q = q.eq('class_id', params.class_id);
  if (params.student_id) q = q.eq('student_id', params.student_id);
  if (params.date) q = q.eq('date', params.date);
  if (params.from) q = q.gte('date', params.from);
  if (params.to) q = q.lte('date', params.to);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const fetchAttendanceSummary = async (params = {}) => {
  let q = supabase.from('attendance').select('student_id, status, students(first_name, last_name)');
  if (params.class_id) q = q.eq('class_id', params.class_id);
  if (params.from) q = q.gte('date', params.from);
  if (params.to) q = q.lte('date', params.to);
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const summary = {};
  for (const r of data) {
    if (!summary[r.student_id]) {
      summary[r.student_id] = {
        student_id: r.student_id,
        student: r.students,
        present: 0, absent: 0, late: 0, excused: 0, total: 0,
      };
    }
    summary[r.student_id][r.status]++;
    summary[r.student_id].total++;
  }
  return Object.values(summary);
};

export const bulkUpsertAttendance = async (records) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,class_id,date' })
    .select();
  if (error) throw new Error(error.message);
  return data;
};

export const updateAttendance = async (id, body) => {
  const { data, error } = await supabase
    .from('attendance').update(body).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};
