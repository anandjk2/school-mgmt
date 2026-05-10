import pool from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

function deriveStatus(amount_due, amount_paid, explicit) {
  if (explicit === 'waived') return 'waived';
  if (amount_paid >= amount_due) return 'paid';
  if (amount_paid > 0) return 'partial';
  return 'pending';
}

export const list = async (req, res) => {
  const { student_id, class_id, status, outstanding, due_date_before, page = 1, limit = 50 } = req.query;
  let sql = `
    SELECT f.*, s.first_name, s.last_name, c.name AS class_name
    FROM fees f
    JOIN students s ON f.student_id = s.id
    LEFT JOIN classes c ON f.class_id = c.id
    WHERE f.tenant_id = $1
  `;
  const params = [req.tenantId];
  let i = 2;
  if (student_id)          { sql += ` AND f.student_id = $${i++}`;  params.push(student_id); }
  if (class_id)            { sql += ` AND f.class_id = $${i++}`;    params.push(class_id); }
  if (outstanding === '1') { sql += " AND f.status IN ('pending', 'partial')"; }
  else if (status)         { sql += ` AND f.status = $${i++}`;      params.push(status); }
  if (due_date_before)     { sql += ` AND f.due_date <= $${i++}`;   params.push(due_date_before); }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS n FROM (${sql}) t`, params);
  const total = countResult.rows[0].n;

  sql += ` ORDER BY f.due_date DESC, f.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  const result = await pool.query(sql, params);
  ok(res, result.rows, { total });
};

export const create = async (req, res) => {
  const { student_id, class_id, fee_type, description, amount_due, amount_paid = 0, billing_frequency, due_date, paid_on, status } = req.body;
  const finalStatus = deriveStatus(amount_due, amount_paid, status);
  const ins = await pool.query(`
    INSERT INTO fees (tenant_id, student_id, class_id, fee_type, description, amount_due, amount_paid, billing_frequency, due_date, paid_on, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `, [req.tenantId, student_id, class_id ?? null, fee_type, description, amount_due, amount_paid,
      billing_frequency ?? null, due_date, paid_on, finalStatus]);
  const full = await pool.query(
    'SELECT f.*, c.name AS class_name FROM fees f LEFT JOIN classes c ON f.class_id = c.id WHERE f.id = $1',
    [ins.rows[0].id]
  );
  created(res, full.rows[0]);
};

export const update = async (req, res) => {
  const check = await pool.query(
    'SELECT * FROM fees WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  const fee = check.rows[0];
  if (!fee) return notFound(res, 'Fee record not found');

  const amount_due  = req.body.amount_due  ?? fee.amount_due;
  const amount_paid = req.body.amount_paid ?? fee.amount_paid;
  const status      = deriveStatus(amount_due, amount_paid, req.body.status);
  const paid_on     = req.body.paid_on ?? (status === 'paid' && !fee.paid_on
    ? new Date().toISOString().split('T')[0]
    : fee.paid_on);

  await pool.query(`
    UPDATE fees SET class_id=$1, fee_type=$2, description=$3, amount_due=$4, amount_paid=$5,
      billing_frequency=$6, due_date=$7, paid_on=$8, status=$9, updated_at=NOW()
    WHERE id=$10 AND tenant_id=$11
  `, [
    req.body.class_id !== undefined ? (req.body.class_id ?? null) : fee.class_id,
    req.body.fee_type            ?? fee.fee_type,
    req.body.description         ?? fee.description,
    amount_due, amount_paid,
    req.body.billing_frequency !== undefined ? (req.body.billing_frequency ?? null) : fee.billing_frequency,
    req.body.due_date            ?? fee.due_date,
    paid_on, status, req.params.id, req.tenantId,
  ]);
  const updated = await pool.query(
    'SELECT f.*, c.name AS class_name FROM fees f LEFT JOIN classes c ON f.class_id = c.id WHERE f.id = $1',
    [req.params.id]
  );
  ok(res, updated.rows[0]);
};

export const remove = async (req, res) => {
  const check = await pool.query(
    'SELECT id FROM fees WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Fee record not found');
  await pool.query('DELETE FROM fees WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenantId]);
  noContent(res);
};

export const summary = async (req, res) => {
  const { student_id } = req.query;
  let sql = `
    SELECT COALESCE(SUM(amount_due), 0)::float  AS total_due,
           COALESCE(SUM(amount_paid), 0)::float AS total_paid
    FROM fees WHERE tenant_id = $1
  `;
  const params = [req.tenantId];
  if (student_id) { sql += ' AND student_id = $2'; params.push(student_id); }
  const result = await pool.query(sql, params);
  const row = result.rows[0];
  ok(res, {
    total_due:   parseFloat(row.total_due)  || 0,
    total_paid:  parseFloat(row.total_paid) || 0,
    outstanding: (parseFloat(row.total_due) || 0) - (parseFloat(row.total_paid) || 0),
  });
};
