import db from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

export const list = (req, res) => {
  const { class_id, date, student_id, from, to } = req.query;
  let sql = `
    SELECT a.*, s.first_name, s.last_name, c.name as class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON a.class_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (class_id)   { sql += ' AND a.class_id = ?';   params.push(class_id); }
  if (student_id) { sql += ' AND a.student_id = ?';  params.push(student_id); }
  if (date)       { sql += ' AND a.date = ?';         params.push(date); }
  if (from)       { sql += ' AND a.date >= ?';        params.push(from); }
  if (to)         { sql += ' AND a.date <= ?';        params.push(to); }
  sql += ' ORDER BY a.date DESC, s.last_name';
  ok(res, db.prepare(sql).all(...params));
};

export const create = (req, res) => {
  const { student_id, class_id, date, status, notes } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO attendance (student_id, class_id, date, status, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(student_id, class_id, date, status, notes);
    created(res, db.prepare('SELECT * FROM attendance WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      db.prepare('UPDATE attendance SET status=?, notes=? WHERE student_id=? AND class_id=? AND date=?')
        .run(status, notes, student_id, class_id, date);
      const row = db.prepare('SELECT * FROM attendance WHERE student_id=? AND class_id=? AND date=?')
        .get(student_id, class_id, date);
      return ok(res, row);
    }
    throw e;
  }
};

export const update = (req, res) => {
  const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res, 'Attendance record not found');
  const { status, notes } = req.body;
  db.prepare('UPDATE attendance SET status=?, notes=? WHERE id=?').run(
    status ?? row.status, notes ?? row.notes, req.params.id
  );
  ok(res, db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id));
};

export const remove = (req, res) => {
  const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res, 'Attendance record not found');
  db.prepare('DELETE FROM attendance WHERE id = ?').run(req.params.id);
  noContent(res);
};

export const bulkUpsert = (req, res) => {
  const { class_id, date, records } = req.body;
  const upsert = db.prepare(`
    INSERT INTO attendance (student_id, class_id, date, status, notes)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, class_id, date) DO UPDATE SET status=excluded.status, notes=excluded.notes
  `);
  const upsertAll = db.transaction((recs) => {
    for (const r of recs) upsert.run(r.student_id, class_id, date, r.status, r.notes ?? null);
  });
  upsertAll(records);
  ok(res, { class_id, date, count: records.length });
};

export const summary = (req, res) => {
  const { student_id, class_id, from, to } = req.query;
  let sql = 'SELECT status, COUNT(*) as count FROM attendance WHERE 1=1';
  const params = [];
  if (student_id) { sql += ' AND student_id = ?'; params.push(student_id); }
  if (class_id)   { sql += ' AND class_id = ?';   params.push(class_id); }
  if (from)       { sql += ' AND date >= ?';        params.push(from); }
  if (to)         { sql += ' AND date <= ?';        params.push(to); }
  sql += ' GROUP BY status';
  const rows = db.prepare(sql).all(...params);
  const totals = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  for (const r of rows) { totals[r.status] = r.count; totals.total += r.count; }
  ok(res, totals);
};
