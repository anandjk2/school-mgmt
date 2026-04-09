import db from '../db/connection.js';
import { ok, created, noContent, notFound, conflict } from '../utils/response.js';

export const list = (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (search) {
    sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const total = db.prepare(`SELECT COUNT(*) as n FROM (${sql})`).get(...params).n;
  sql += ' ORDER BY last_name, first_name LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  ok(res, db.prepare(sql).all(...params), { total, page: Number(page), limit: Number(limit) });
};

export const getOne = (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return notFound(res, 'Student not found');

  const classes = db.prepare(`
    SELECT c.*, sc.id as assignment_id, sc.enrolled_on, sc.disenrolled_on
    FROM classes c JOIN student_classes sc ON c.id = sc.class_id
    WHERE sc.student_id = ?
    ORDER BY sc.disenrolled_on IS NULL DESC, sc.enrolled_on DESC
  `).all(req.params.id);

  ok(res, { ...student, classes });
};

export const create = (req, res) => {
  const { first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO students (first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(first_name, last_name, date_of_birth, gender, email, phone, address,
           enrolled_on || new Date().toISOString().split('T')[0], status || 'active');

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    created(res, student);
  } catch (e) {
    if (e.message.includes('UNIQUE')) return conflict(res, 'Email already exists');
    throw e;
  }
};

export const update = (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return notFound(res, 'Student not found');

  const { first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status } = req.body;
  try {
    db.prepare(`
      UPDATE students SET first_name=?, last_name=?, date_of_birth=?, gender=?, email=?,
        phone=?, address=?, enrolled_on=?, status=?, updated_at=datetime('now')
      WHERE id=?
    `).run(first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, req.params.id);
    ok(res, db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return conflict(res, 'Email already exists');
    throw e;
  }
};

export const remove = (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return notFound(res, 'Student not found');
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  noContent(res);
};

export const getClasses = (req, res) => {
  const { active } = req.query;
  let sql = `
    SELECT c.*, sc.id as assignment_id, sc.enrolled_on, sc.disenrolled_on
    FROM classes c JOIN student_classes sc ON c.id = sc.class_id
    WHERE sc.student_id = ?
  `;
  const params = [req.params.id];
  if (active === '1') { sql += ' AND sc.disenrolled_on IS NULL'; }
  sql += ' ORDER BY sc.enrolled_on DESC';
  ok(res, db.prepare(sql).all(...params));
};

export const getAttendance = (req, res) => {
  const { from, to, class_id } = req.query;
  let sql = 'SELECT a.*, c.name as class_name FROM attendance a JOIN classes c ON a.class_id = c.id WHERE a.student_id = ?';
  const params = [req.params.id];
  if (from) { sql += ' AND a.date >= ?'; params.push(from); }
  if (to)   { sql += ' AND a.date <= ?'; params.push(to); }
  if (class_id) { sql += ' AND a.class_id = ?'; params.push(class_id); }
  sql += ' ORDER BY a.date DESC';
  ok(res, db.prepare(sql).all(...params));
};

export const getFees = (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM fees WHERE student_id = ?';
  const params = [req.params.id];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY due_date DESC, created_at DESC';
  ok(res, db.prepare(sql).all(...params));
};
