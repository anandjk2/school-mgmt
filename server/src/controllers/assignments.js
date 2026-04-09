import db from '../db/connection.js';
import { ok, created, noContent, notFound, conflict } from '../utils/response.js';

const today = () => new Date().toISOString().split('T')[0];

export const assign = (req, res) => {
  const { student_id, class_id } = req.body;
  const student = db.prepare('SELECT id FROM students WHERE id = ?').get(student_id);
  if (!student) return notFound(res, 'Student not found');
  const cls = db.prepare('SELECT id FROM classes WHERE id = ?').get(class_id);
  if (!cls) return notFound(res, 'Class not found');

  // If a record already exists (possibly disenrolled), re-enroll rather than insert
  const existing = db.prepare('SELECT * FROM student_classes WHERE student_id = ? AND class_id = ?').get(student_id, class_id);
  if (existing) {
    if (!existing.disenrolled_on) return conflict(res, 'Student already enrolled in this class');
    db.prepare('UPDATE student_classes SET enrolled_on = ?, disenrolled_on = NULL WHERE id = ?').run(today(), existing.id);
    return created(res, db.prepare('SELECT * FROM student_classes WHERE id = ?').get(existing.id));
  }

  const result = db.prepare(
    'INSERT INTO student_classes (student_id, class_id, enrolled_on) VALUES (?, ?, ?)'
  ).run(student_id, class_id, today());
  created(res, db.prepare('SELECT * FROM student_classes WHERE id = ?').get(result.lastInsertRowid));
};

export const bulkAssign = (req, res) => {
  const { assignments } = req.body;
  const todayStr = today();
  const insert   = db.prepare('INSERT OR IGNORE INTO student_classes (student_id, class_id, enrolled_on) VALUES (?, ?, ?)');
  const reenroll = db.prepare('UPDATE student_classes SET enrolled_on = ?, disenrolled_on = NULL WHERE student_id = ? AND class_id = ? AND disenrolled_on IS NOT NULL');
  const insertAll = db.transaction((list) => {
    let count = 0;
    for (const { student_id, class_id } of list) {
      const updated = reenroll.run(todayStr, student_id, class_id);
      if (updated.changes > 0) { count++; continue; }
      const r = insert.run(student_id, class_id, todayStr);
      count += r.changes;
    }
    return count;
  });
  const count = insertAll(assignments);
  ok(res, { inserted: count });
};

// Soft disenroll – records the date, keeps the history
export const disenroll = (req, res) => {
  const row = db.prepare('SELECT * FROM student_classes WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res, 'Assignment not found');
  if (row.disenrolled_on) return conflict(res, 'Student already disenrolled');
  db.prepare('UPDATE student_classes SET disenrolled_on = ? WHERE id = ?').run(today(), req.params.id);
  ok(res, db.prepare('SELECT * FROM student_classes WHERE id = ?').get(req.params.id));
};

// Re-enroll a previously disenrolled student (resets enrolled_on to today)
export const reenroll = (req, res) => {
  const row = db.prepare('SELECT * FROM student_classes WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res, 'Assignment not found');
  db.prepare('UPDATE student_classes SET enrolled_on = ?, disenrolled_on = NULL WHERE id = ?').run(today(), req.params.id);
  ok(res, db.prepare('SELECT * FROM student_classes WHERE id = ?').get(req.params.id));
};

export const removeById = (req, res) => {
  const row = db.prepare('SELECT * FROM student_classes WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res, 'Assignment not found');
  db.prepare('DELETE FROM student_classes WHERE id = ?').run(req.params.id);
  noContent(res);
};

export const removeByStudentClass = (req, res) => {
  const { student_id, class_id } = req.body;
  const row = db.prepare('SELECT * FROM student_classes WHERE student_id = ? AND class_id = ?').get(student_id, class_id);
  if (!row) return notFound(res, 'Assignment not found');
  db.prepare('DELETE FROM student_classes WHERE student_id = ? AND class_id = ?').run(student_id, class_id);
  noContent(res);
};
