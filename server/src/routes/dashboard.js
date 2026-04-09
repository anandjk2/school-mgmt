import { Router } from 'express';
import db from '../db/connection.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const totalStudents   = db.prepare("SELECT COUNT(*) as n FROM students WHERE status='active'").get().n;
  const totalClasses    = db.prepare("SELECT COUNT(*) as n FROM classes").get().n;
  const presentToday    = db.prepare("SELECT COUNT(*) as n FROM attendance WHERE date=? AND status='present'").get(today).n;
  const absentToday     = db.prepare("SELECT COUNT(*) as n FROM attendance WHERE date=? AND status='absent'").get(today).n;
  const pendingFees     = db.prepare("SELECT COUNT(*) as n FROM fees WHERE status IN ('pending','partial')").get().n;
  const totalOutstanding = db.prepare("SELECT COALESCE(SUM(amount_due - amount_paid),0) as n FROM fees WHERE status IN ('pending','partial')").get().n;
  const recentStudents  = db.prepare("SELECT * FROM students ORDER BY created_at DESC LIMIT 5").all();
  const recentFees      = db.prepare("SELECT f.*, s.first_name, s.last_name FROM fees f JOIN students s ON f.student_id=s.id ORDER BY f.created_at DESC LIMIT 5").all();

  ok(res, {
    totalStudents, totalClasses, presentToday, absentToday,
    pendingFees, totalOutstanding, recentStudents, recentFees,
  });
});

export default router;
