import { Router } from 'express';
import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ok, badRequest, notFound } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return badRequest(res, 'Email and password required');

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return badRequest(res, 'Invalid credentials');
  }

  let tenantName = null;
  if (user.tenant_id) {
    const t = await pool.query('SELECT name FROM tenants WHERE id = $1', [user.tenant_id]);
    tenantName = t.rows[0]?.name ?? null;
  }

  const token = jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  ok(res, {
    token,
    user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name },
    tenantId: user.tenant_id,
    tenantName,
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, first_name, last_name, tenant_id FROM users WHERE id = $1',
    [req.user.userId]
  );
  const user = rows[0];
  if (!user) return notFound(res, 'User not found');

  let tenantName = null;
  if (user.tenant_id) {
    const t = await pool.query('SELECT name FROM tenants WHERE id = $1', [user.tenant_id]);
    tenantName = t.rows[0]?.name ?? null;
  }

  ok(res, { ...user, tenantName });
});

export default router;
