import { Router } from 'express';
import pool from '../db/connection.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

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
    pool.query("SELECT COUNT(*)::int AS n FROM students WHERE status='active'"),
    pool.query("SELECT COUNT(*)::int AS n FROM classes"),
    pool.query("SELECT COUNT(*)::int AS n FROM attendance WHERE date=$1 AND status='present'", [today]),
    pool.query("SELECT COUNT(*)::int AS n FROM attendance WHERE date=$1 AND status='absent'",  [today]),
    pool.query("SELECT COUNT(*)::int AS n FROM fees WHERE status IN ('pending','partial')"),
    pool.query("SELECT COALESCE(SUM(amount_due - amount_paid), 0)::float AS n FROM fees WHERE status IN ('pending','partial')"),
    pool.query("SELECT * FROM students ORDER BY created_at DESC LIMIT 5"),
    pool.query("SELECT f.*, s.first_name, s.last_name FROM fees f JOIN students s ON f.student_id=s.id ORDER BY f.created_at DESC LIMIT 5"),
  ]);

  ok(res, {
    totalStudents, totalClasses, presentToday, absentToday,
    pendingFees, totalOutstanding: parseFloat(totalOutstanding) || 0,
    recentStudents, recentFees,
  });
});

export default router;
