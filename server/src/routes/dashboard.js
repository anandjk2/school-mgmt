import { Router } from 'express';
import pool from '../db/connection.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tid = req.tenantId;

  const [
    { rows: [{ n: totalStudents }] },
    { rows: [{ n: totalClasses }] },
    { rows: [{ n: presentToday }] },
    { rows: [{ n: absentToday }] },
    { rows: [{ n: pendingFees }] },
    { rows: [{ n: totalOutstanding }] },
    { rows: recentStudents },
    { rows: recentFees },
  ] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM students  WHERE tenant_id=$1 AND status='active'", [tid]),
    pool.query("SELECT COUNT(*)::int AS n FROM classes   WHERE tenant_id=$1", [tid]),
    pool.query("SELECT COUNT(*)::int AS n FROM attendance WHERE tenant_id=$1 AND date=$2 AND status='present'", [tid, today]),
    pool.query("SELECT COUNT(*)::int AS n FROM attendance WHERE tenant_id=$1 AND date=$2 AND status='absent'",  [tid, today]),
    pool.query("SELECT COUNT(*)::int AS n FROM fees WHERE tenant_id=$1 AND status IN ('pending','partial')", [tid]),
    pool.query("SELECT COALESCE(SUM(amount_due - amount_paid), 0)::float AS n FROM fees WHERE tenant_id=$1 AND status IN ('pending','partial')", [tid]),
    pool.query("SELECT * FROM students WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 5", [tid]),
    pool.query("SELECT f.*, s.first_name, s.last_name FROM fees f JOIN students s ON f.student_id=s.id WHERE f.tenant_id=$1 ORDER BY f.created_at DESC LIMIT 5", [tid]),
  ]);

  ok(res, {
    totalStudents, totalClasses, presentToday, absentToday,
    pendingFees, totalOutstanding: parseFloat(totalOutstanding) || 0,
    recentStudents, recentFees,
  });
});

export default router;
