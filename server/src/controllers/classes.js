import pool from '../db/connection.js';
import { ok, created, noContent, notFound } from '../utils/response.js';

export const list = async (req, res) => {
  const { academic_year, grade_level } = req.query;
  let sql = `
    SELECT c.*, COUNT(sc.id)::int AS student_count
    FROM classes c LEFT JOIN student_classes sc ON c.id = sc.class_id
    WHERE c.tenant_id = $1
  `;
  const params = [req.tenantId];
  let i = 2;
  if (academic_year) { sql += ` AND c.academic_year = $${i++}`; params.push(academic_year); }
  if (grade_level)   { sql += ` AND c.grade_level = $${i++}`;   params.push(grade_level); }
  sql += ' GROUP BY c.id ORDER BY c.grade_level, c.name';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};

export const getOne = async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, COUNT(sc.id)::int AS student_count
    FROM classes c LEFT JOIN student_classes sc ON c.id = sc.class_id
    WHERE c.id = $1 AND c.tenant_id = $2 GROUP BY c.id
  `, [req.params.id, req.tenantId]);
  if (!result.rows[0]) return notFound(res, 'Class not found');
  ok(res, result.rows[0]);
};

export const create = async (req, res) => {
  const { name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency } = req.body;
  const result = await pool.query(`
    INSERT INTO classes (tenant_id, name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [req.tenantId, name, grade_level, section, subject, teacher_name, room_number, academic_year,
      capacity || 40, fee_amount ?? null, billing_frequency ?? null]);
  created(res, result.rows[0]);
};

export const update = async (req, res) => {
  const check = await pool.query(
    'SELECT * FROM classes WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  const cls = check.rows[0];
  if (!cls) return notFound(res, 'Class not found');

  const { name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity, fee_amount, billing_frequency } = req.body;
  const result = await pool.query(`
    UPDATE classes SET name=$1, grade_level=$2, section=$3, subject=$4, teacher_name=$5,
      room_number=$6, academic_year=$7, capacity=$8, fee_amount=$9, billing_frequency=$10, updated_at=NOW()
    WHERE id=$11 AND tenant_id=$12
    RETURNING *
  `, [name, grade_level, section, subject, teacher_name, room_number, academic_year, capacity,
      fee_amount ?? cls.fee_amount, billing_frequency ?? cls.billing_frequency, req.params.id, req.tenantId]);
  ok(res, result.rows[0]);
};

export const remove = async (req, res) => {
  const check = await pool.query(
    'SELECT id FROM classes WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.tenantId]
  );
  if (!check.rows[0]) return notFound(res, 'Class not found');
  await pool.query('DELETE FROM classes WHERE id = $1 AND tenant_id = $2', [req.params.id, req.tenantId]);
  noContent(res);
};

export const getStudents = async (req, res) => {
  const { active } = req.query;
  let sql = `
    SELECT s.*, sc.id AS assignment_id, sc.enrolled_on AS class_enrolled_on,
           sc.disenrolled_on AS class_disenrolled_on
    FROM students s JOIN student_classes sc ON s.id = sc.student_id
    WHERE sc.class_id = $1 AND sc.tenant_id = $2
  `;
  const params = [req.params.id, req.tenantId];
  if (active === '1') sql += ' AND sc.disenrolled_on IS NULL';
  sql += ' ORDER BY s.last_name, s.first_name';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};

export const getAttendance = async (req, res) => {
  const { date } = req.query;
  let sql = `
    SELECT a.*, s.first_name, s.last_name
    FROM attendance a JOIN students s ON a.student_id = s.id
    WHERE a.class_id = $1 AND a.tenant_id = $2
  `;
  const params = [req.params.id, req.tenantId];
  if (date) { sql += ' AND a.date = $3'; params.push(date); }
  sql += ' ORDER BY a.date DESC, s.last_name';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};
