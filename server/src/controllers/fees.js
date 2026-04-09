import db from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

function deriveStatus(amount_due, amount_paid, explicit) {
  if (explicit === 'waived') return 'waived';
  if (amount_paid >= amount_due) return 'paid';
  if (amount_paid > 0) return 'partial';
  return 'pending';
}

export const list = (req, res) => {
  const { student_id, class_id, status, outstanding, due_date_before, page = 1, limit = 50 } = req.query;
  let sql = `
    SELECT f.*, s.first_name, s.last_name,
           c.name as class_name
    FROM fees f
    JOIN students s ON f.student_id = s.id
    LEFT JOIN classes c ON f.class_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (student_id)        { sql += ' AND f.student_id = ?';  params.push(student_id); }
  if (class_id)          { sql += ' AND f.class_id = ?';    params.push(class_id); }
  if (outstanding === '1') { sql += " AND f.status IN ('pending', 'partial')"; }
  else if (status)       { sql += ' AND f.status = ?';      params.push(status); }
  if (due_date_before)   { sql += ' AND f.due_date <= ?';   params.push(due_date_before); }
  const total = db.prepare(`SELECT COUNT(*) as n FROM (${sql})`).get(...params).n;
  sql += ' ORDER BY f.due_date DESC, f.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  ok(res, db.prepare(sql).all(...params), { total });
};

export const create = (req, res) => {
  const { student_id, class_id, fee_type, description, amount_due, amount_paid = 0, billing_frequency, due_date, paid_on, status } = req.body;
  const finalStatus = deriveStatus(amount_due, amount_paid, status);
  const result = db.prepare(`
    INSERT INTO fees (student_id, class_id, fee_type, description, amount_due, amount_paid, billing_frequency, due_date, paid_on, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(student_id, class_id ?? null, fee_type, description, amount_due, amount_paid, billing_frequency ?? null, due_date, paid_on, finalStatus);
  const row = db.prepare(`
    SELECT f.*, c.name as class_name FROM fees f LEFT JOIN classes c ON f.class_id = c.id WHERE f.id = ?
  `).get(result.lastInsertRowid);
  created(res, row);
};

export const update = (req, res) => {
  const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(req.params.id);
  if (!fee) return notFound(res, 'Fee record not found');

  const amount_due  = req.body.amount_due  ?? fee.amount_due;
  const amount_paid = req.body.amount_paid ?? fee.amount_paid;
  const status      = deriveStatus(amount_due, amount_paid, req.body.status);
  const paid_on     = req.body.paid_on ?? (status === 'paid' && !fee.paid_on ? new Date().toISOString().split('T')[0] : fee.paid_on);

  db.prepare(`
    UPDATE fees SET class_id=?, fee_type=?, description=?, amount_due=?, amount_paid=?,
      billing_frequency=?, due_date=?, paid_on=?, status=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    req.body.class_id        !== undefined ? (req.body.class_id ?? null) : fee.class_id,
    req.body.fee_type        ?? fee.fee_type,
    req.body.description     ?? fee.description,
    amount_due, amount_paid,
    req.body.billing_frequency !== undefined ? (req.body.billing_frequency ?? null) : fee.billing_frequency,
    req.body.due_date        ?? fee.due_date,
    paid_on, status, req.params.id
  );
  const updated = db.prepare(`
    SELECT f.*, c.name as class_name FROM fees f LEFT JOIN classes c ON f.class_id = c.id WHERE f.id = ?
  `).get(req.params.id);
  ok(res, updated);
};

export const remove = (req, res) => {
  const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(req.params.id);
  if (!fee) return notFound(res, 'Fee record not found');
  db.prepare('DELETE FROM fees WHERE id = ?').run(req.params.id);
  noContent(res);
};

export const summary = (req, res) => {
  const { student_id } = req.query;
  let sql = 'SELECT SUM(amount_due) as total_due, SUM(amount_paid) as total_paid FROM fees WHERE 1=1';
  const params = [];
  if (student_id) { sql += ' AND student_id = ?'; params.push(student_id); }
  const row = db.prepare(sql).get(...params);
  ok(res, {
    total_due:     row.total_due || 0,
    total_paid:    row.total_paid || 0,
    outstanding:   (row.total_due || 0) - (row.total_paid || 0),
  });
};
