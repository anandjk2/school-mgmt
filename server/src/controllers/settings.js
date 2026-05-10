import pool from '../db/connection.js';
import { ok } from '../utils/response.js';

const ALLOWED_KEYS = [
  'school_name', 'tagline', 'address', 'phone',
  'email', 'website', 'academic_year', 'principal_name',
];

export const getAll = async (req, res) => {
  const result = await pool.query(
    'SELECT key, value FROM settings WHERE tenant_id = $1',
    [req.tenantId]
  );
  ok(res, Object.fromEntries(result.rows.map(r => [r.key, r.value])));
};

export const updateAll = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const key of ALLOWED_KEYS) {
      if (key in req.body) {
        await client.query(
          'INSERT INTO settings (tenant_id, key, value) VALUES ($1, $2, $3) ON CONFLICT(tenant_id, key) DO UPDATE SET value=EXCLUDED.value',
          [req.tenantId, key, req.body[key] ?? '']
        );
      }
    }
    await client.query('COMMIT');
    const result = await pool.query(
      'SELECT key, value FROM settings WHERE tenant_id = $1',
      [req.tenantId]
    );
    ok(res, Object.fromEntries(result.rows.map(r => [r.key, r.value])));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
