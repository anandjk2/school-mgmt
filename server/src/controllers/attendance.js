import pool from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

export const list = async (req, res) => {
  const { class_id, date, student_id, from, to } = req.query;
  let sql = `
    SELECT a.*, s.first_name, s.last_name, c.name AS class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON a.class_id = c.id
    WHERE a.tenant_id = $1
  `;
  const params = [req.tenantId];
  let i = 2;
  if (class_id)   { sql += ` AND a.class_id = $${i++}`;   params.push(class_id); }
  if (student_id) { sql += ` AND a.student_id = $${i++}`;  params.push(student_id); }
  if (date)       { sql += ` AND a.date = $${i++}`;         params.push(date); }
  if (from)       { sql += ` AND a.date >= $${i++}`;        params.push(from); }
  if (to)         { sql += ` AND a.date <= $${i++}`;        params.push(to); }
  sql += ' ORDER BY a.date DESC, s.last_name';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};

export const create = async (req, res) => {
  const { student_id, class_id, date, status, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO attendance (tenant_id, student_id, class_id, date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.tenantId, student_id, class_id, date, status, notes]
    );
    created(res, result.rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      const upd = await pool.query(
        'UPDATE attendance SET status=$1, notes=$2 WHERE student_id=$3 AND class_id=$4 AND date=$5 AND tenant_id=$6 RETURNING *',
        [status, notes, student_id, class_id, date, req.tenantId]
      );
      return ok(res, upd.rows[0]);
    }
    throw e;
  }
};

export const update = async (req, res) => {
  const check = await pool.query(
    'SELECT * FROM attendance WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  const row = check.rows[0];
  if (!row) return notFound(res, 'Attendance record not found');
  const { status, notes } = req.body;
  const result = await pool.query(
    'UPDATE attendance SET status=$1, notes=$2 WHERE id=$3 AND tenant_id=$4 RETURNING *',
    [status ?? row.status, notes ?? row.notes, req.params.id, req.tenantId]
  );
  ok(res, result.rows[0]);
};

export const remove = async (req, res) => {
  const check = await pool.query(
    'SELECT id FROM attendance WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Attendance record not found');
  await pool.query('DELETE FROM attendance WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenantId]);
  noContent(res);
};

export const bulkUpsert = async (req, res) => {
  const { class_id, date, records } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of records) {
      await client.query(`
        INSERT INTO attendance (tenant_id, student_id, class_id, date, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT(student_id, class_id, date) DO UPDATE SET status=EXCLUDED.status, notes=EXCLUDED.notes
      `, [req.tenantId, r.student_id, class_id, date, r.status, r.notes ?? null]);
    }
    await client.query('COMMIT');
    ok(res, { class_id, date, count: records.length });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const summary = async (req, res) => {
  const { student_id, class_id, from, to } = req.query;
  let sql = 'SELECT status, COUNT(*)::int AS count FROM attendance WHERE tenant_id = $1';
  const params = [req.tenantId];
  let i = 2;
  if (student_id) { sql += ` AND student_id = $${i++}`; params.push(student_id); }
  if (class_id)   { sql += ` AND class_id = $${i++}`;   params.push(class_id); }
  if (from)       { sql += ` AND date >= $${i++}`;        params.push(from); }
  if (to)         { sql += ` AND date <= $${i++}`;        params.push(to); }
  sql += ' GROUP BY status';
  const result = await pool.query(sql, params);
  const totals = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  for (const r of result.rows) { totals[r.status] = r.count; totals.total += r.count; }
  ok(res, totals);
};
