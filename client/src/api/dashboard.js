import { supabase } from '../lib/supabase.js';

export const fetchDashboard = async () => {
  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: totalClasses },
    { data: recentStudents },
    { data: recentFees },
    { data: feeStats },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('fees').select('*, students(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('fees').select('amount_due, amount_paid, status'),
  ]);

  return {
    totalStudents,
    activeStudents,
    totalClasses,
    recentStudents,
    recentFees,
    totalDue: feeStats?.reduce((s, r) => s + Number(r.amount_due), 0) ?? 0,
    totalPaid: feeStats?.reduce((s, r) => s + Number(r.amount_paid), 0) ?? 0,
    pendingFees: feeStats?.filter(r => r.status === 'pending').length ?? 0,
  };
};
