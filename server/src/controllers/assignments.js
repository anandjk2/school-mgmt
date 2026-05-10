import pool from '../db/connection.js';
import { ok, created, noContent, notFound, conflict } from '../utils/response.js';

const today = () => new Date().toISOString().split('T')[0];

export const assign = async (req, res) => {
  const { student_id, class_id } = req.body;
  const [sCheck, cCheck] = await Promise.all([
    pool.query('SELECT id FROM students WHERE id = $1 AND tenant_id = $2', [student_id, req.tenantId]),
    pool.query('SELECT id FROM classes  WHERE id = $1 AND tenant_id = $2', [class_id,   req.tenantId]),
  ]);
  if (!sCheck.rows[0]) return notFound(res, 'Student not found');
  if (!cCheck.rows[0]) return notFound(res, 'Class not found');

  const existing = await pool.query(
    'SELECT * FROM student_classes WHERE student_id = $1 AND class_id = $2 AND tenant_id = $3',
    [student_id, class_id, req.tenantId]
  );
  if (existing.rows[0]) {
    if (!existing.rows[0].disenrolled_on) return conflict(res, 'Student already enrolled in this class');
    const result = await pool.query(
      'UPDATE student_classes SET enrolled_on=$1, disenrolled_on=NULL WHERE id=$2 AND tenant_id=$3 RETURNING *',
      [today(), existing.rows[0].id, req.tenantId]
    );
    return created(res, result.rows[0]);
  }

  const result = await pool.query(
    'INSERT INTO student_classes (tenant_id, student_id, class_id, enrolled_on) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.tenantId, student_id, class_id, today()]
  );
  created(res, result.rows[0]);
};

export const bulkAssign = async (req, res) => {
  const { assignments } = req.body;
  const todayStr = today();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let count = 0;
    for (const { student_id, class_id } of assignments) {
      const upd = await client.query(
        'UPDATE student_classes SET enrolled_on=$1, disenrolled_on=NULL WHERE student_id=$2 AND class_id=$3 AND tenant_id=$4 AND disenrolled_on IS NOT NULL',
        [todayStr, student_id, class_id, req.tenantId]
      );
      if (upd.rowCount > 0) { count++; continue; }
      const ins = await client.query(
        'INSERT INTO student_classes (tenant_id, student_id, class_id, enrolled_on) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [req.tenantId, student_id, class_id, todayStr]
      );
      count += ins.rowCount;
    }
    await client.query('COMMIT');
    ok(res, { inserted: count });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const disenroll = async (req, res) => {
  const check = await pool.query(
    'SELECT * FROM student_classes WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  const row = check.rows[0];
  if (!row) return notFound(res, 'Assignment not found');
  if (row.disenrolled_on) return conflict(res, 'Student already disenrolled');
  const result = await pool.query(
    'UPDATE student_classes SET disenrolled_on=$1 WHERE id=$2 AND tenant_id=$3 RETURNING *',
    [today(), req.params.id, req.tenantId]
  );
  ok(res, result.rows[0]);
};

export const reenroll = async (req, res) => {
  const check = await pool.query(
    'SELECT id FROM student_classes WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Assignment not found');
  const result = await pool.query(
    'UPDATE student_classes SET enrolled_on=$1, disenrolled_on=NULL WHERE id=$2 AND tenant_id=$3 RETURNING *',
    [today(), req.params.id, req.tenantId]
  );
  ok(res, result.rows[0]);
};

export const removeById = async (req, res) => {
  const check = await pool.query(
    'SELECT id FROM student_classes WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Assignment not found');
  await pool.query('DELETE FROM student_classes WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenantId]);
  noContent(res);
};

export const removeByStudentClass = async (req, res) => {
  const { student_id, class_id } = req.body;
  const check = await pool.query(
    'SELECT id FROM student_classes WHERE student_id=$1 AND class_id=$2 AND tenant_id=$3',
    [student_id, class_id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Assignment not found');
  await pool.query(
    'DELETE FROM student_classes WHERE student_id=$1 AND class_id=$2 AND tenant_id=$3',
    [student_id, class_id, req.tenantId]
  );
  noContent(res);
};
