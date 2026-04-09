import db from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

export const list = (req, res) => {
  const { academic_year, grade_level } = req.query;
  let sql = `
    SELECT c.*, COUNT(sc.id) as student_count
    FROM classes c LEFT JOIN student_classes sc ON c.id = sc.class_id
    WHERE 1=1
  `;
  const params = [];
  if (academic_year) { sql += ' AND c.academic_year = ?'; params.push(academic_year); }
  if (grade_level)   { sql += ' AND c.grade_level = ?';   params.push(grade_level); }
  sql += ' GROUP BY c.id ORDER BY c.grade_level, c.name';
  ok(res, db.prepare(sql).all(...params));
};

export const getOne = (req, res) => {
  const cls = db.prepare(`
    SELECT c.*, COUNT(sc.id) as student_count
    FROM classes c LEFT JOIN student_classes sc ON c.id = sc.class_id
    WHERE c.id = ? GROUP BY c.id
  `).get(req.params.id);
  if (!cls) return notFound(res, 'Class not found');
  ok(res, cls);
};

export const create = (req, res) => {
  const { name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency } = req.body;
  const result = db.prepare(`
    INSERT INTO classes (name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity || 40, fee_amount ?? null, billing_frequency ?? null);
  created(res, db.prepare('SELECT * FROM classes WHERE id = ?').get(result.lastInsertRowid));
};

export const update = (req, res) => {
  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
  if (!cls) return notFound(res, 'Class not found');
  const { name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency } = req.body;
  db.prepare(`
    UPDATE classes SET name=?, grade_level=?, section=?, subject=?, teacher_name=?,
      room_number=?, academic_year=?, capacity=?, fee_amount=?, billing_frequency=?, updated_at=datetime('now')
    WHERE id=?
  `).run(name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity,
    fee_amount ?? cls.fee_amount, billing_frequency ?? cls.billing_frequency, req.params.id);
  ok(res, db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id));
};

export const remove = (req, res) => {
  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
  if (!cls) return notFound(res, 'Class not found');
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  noContent(res);
};

export const getStudents = (req, res) => {
  const { active } = req.query;
  let sql = `
    SELECT s.*, sc.id as assignment_id, sc.enrolled_on as class_enrolled_on,
           sc.disenrolled_on as class_disenrolled_on
    FROM students s JOIN student_classes sc ON s.id = sc.student_id
    WHERE sc.class_id = ?
  `;
  const params = [req.params.id];
  if (active === '1') { sql += ' AND sc.disenrolled_on IS NULL'; }
  sql += ' ORDER BY s.last_name, s.first_name';
  ok(res, db.prepare(sql).all(...params));
};

export const getAttendance = (req, res) => {
  const { date } = req.query;
  let sql = `
    SELECT a.*, s.first_name, s.last_name
    FROM attendance a JOIN students s ON a.student_id = s.id
    WHERE a.class_id = ?
  `;
  const params = [req.params.id];
  if (date) { sql += ' AND a.date = ?'; params.push(date); }
  sql += ' ORDER BY a.date DESC, s.last_name';
  ok(res, db.prepare(sql).all(...params));
};
