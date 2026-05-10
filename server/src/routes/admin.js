import { Router } from 'express';
import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import { ok, created, noContent, notFound, conflict, badRequest } from '../utils/response.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireSuperAdmin);

// ── Tenants ──────────────────────────────────────────────────────────────────

router.get('/tenants', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
  ok(res, rows);
});

router.post('/tenants', async (req, res) => {
  const { name, subdomain, plan_tier = 'free' } = req.body;
  if (!name) return badRequest(res, 'Tenant name required');
  try {
    const { rows } = await pool.query(
      'INSERT INTO tenants (name, subdomain, plan_tier) VALUES ($1, $2, $3) RETURNING *',
      [name, subdomain || null, plan_tier]
    );
    created(res, rows[0]);
  } catch (e) {
    if (e.code === '23505') return conflict(res, 'Subdomain already taken');
    throw e;
  }
});

router.patch('/tenants/:id', async (req, res) => {
  const check = await pool.query('SELECT * FROM tenants WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return notFound(res, 'Tenant not found');
  const t = check.rows[0];
  const { name, subdomain, status, plan_tier } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE tenants SET name=$1, subdomain=$2, status=$3, plan_tier=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [name ?? t.name, subdomain !== undefined ? subdomain : t.subdomain, status ?? t.status, plan_tier ?? t.plan_tier, req.params.id]
    );
    ok(res, rows[0]);
  } catch (e) {
    if (e.code === '23505') return conflict(res, 'Subdomain already taken');
    throw e;
  }
});

// ── Users within a tenant ─────────────────────────────────────────────────────

router.get('/tenants/:id/users', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, first_name, last_name, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );
  ok(res, rows);
});

router.post('/tenants/:id/users', async (req, res) => {
  const { email, password, role = 'admin', first_name = '', last_name = '' } = req.body;
  if (!email || !password) return badRequest(res, 'Email and password required');
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, tenant_id, created_at`,
      [req.params.id, email.toLowerCase().trim(), hash, role, first_name, last_name]
    );
    created(res, rows[0]);
  } catch (e) {
    if (e.code === '23505') return conflict(res, 'Email already exists for this tenant');
    throw e;
  }
});

router.delete('/users/:id', async (req, res) => {
  const check = await pool.query('SELECT id FROM users WHERE id = $1', [req.params.id]);
  if (!check.rows[0]) return notFound(res, 'User not found');
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  noContent(res);
});

export default router;
