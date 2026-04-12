import pool from '../db/connection.js';
import { ok, created, noContent, notFound, conflict } from '../utils/response.js';

export const list = async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  let i = 1;

  if (status) { sql += ` AND status = $${i++}`; params.push(status); }
  if (search) {
    sql += ` AND (first_name ILIKE $${i} OR last_name ILIKE $${i} OR email ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS n FROM (${sql}) t`, params);
  const total = countResult.rows[0].n;

  sql += ` ORDER BY last_name, first_name LIMIT $${i++} OFFSET $${i++}`;
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const result = await pool.query(sql, params);
  ok(res, result.rows, { total, page: Number(page), limit: Number(limit) });
};

export const getOne = async (req, res) => {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
  const student = result.rows[0];
  if (!student) return notFound(res, 'Student not found');

  const classes = await pool.query(`
    SELECT c.*, sc.id AS assignment_id, sc.enrolled_on, sc.disenrolled_on
    FROM classes c JOIN student_classes sc ON c.id = sc.class_id
    WHERE sc.student_id = $1
    ORDER BY (sc.disenrolled_on IS NULL) DESC, sc.enrolled_on DESC
  `, [req.params.id]);

  ok(res, { ...student, classes: classes.rows });
};

export const create = async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO students (first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [first_name, last_name, date_of_birth, gender, email, phone, address,
        enrolled_on || new Date().toISOString().split('T')[0], status || 'active']);
    created(res, result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return conflict(res, 'Email already exists');
    throw e;
  }
};

export const update = async (req, res) => {
  const check = await pool.query('SELECT id FROM students WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return notFound(res, 'Student not found');

  const { first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status } = req.body;
  try {
    const result = await pool.query(`
      UPDATE students SET first_name=$1, last_name=$2, date_of_birth=$3, gender=$4, email=$5,
        phone=$6, address=$7, enrolled_on=$8, status=$9, updated_at=NOW()
      WHERE id=$10
      RETURNING *
    `, [first_name, last_name, date_of_birth, gender, email, phone, address, enrolled_on, status, req.params.id]);
    ok(res, result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return conflict(res, 'Email already exists');
    throw e;
  }
};

export const remove = async (req, res) => {
  const check = await pool.query('SELECT id FROM students WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return notFound(res, 'Student not found');
  await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
  noContent(res);
};

export const getClasses = async (req, res) => {
  const { active } = req.query;
  let sql = `
    SELECT c.*, sc.id AS assignment_id, sc.enrolled_on, sc.disenrolled_on
    FROM classes c JOIN student_classes sc ON c.id = sc.class_id
    WHERE sc.student_id = $1
  `;
  const params = [req.params.id];
  if (active === '1') sql += ' AND sc.disenrolled_on IS NULL';
  sql += ' ORDER BY sc.enrolled_on DESC';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};

export const getAttendance = async (req, res) => {
  const { from, to, class_id } = req.query;
  let sql = `
    SELECT a.*, c.name AS class_name
    FROM attendance a JOIN classes c ON a.class_id = c.id
    WHERE a.student_id = $1
  `;
  const params = [req.params.id];
  let i = 2;
  if (from)     { sql += ` AND a.date >= $${i++}`; params.push(from); }
  if (to)       { sql += ` AND a.date <= $${i++}`; params.push(to); }
  if (class_id) { sql += ` AND a.class_id = $${i++}`; params.push(class_id); }
  sql += ' ORDER BY a.date DESC';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};

export const getFees = async (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM fees WHERE student_id = $1';
  const params = [req.params.id];
  if (status) { sql += ' AND status = $2'; params.push(status); }
  sql += ' ORDER BY due_date DESC, created_at DESC';
  const result = await pool.query(sql, params);
  ok(res, result.rows);
};
