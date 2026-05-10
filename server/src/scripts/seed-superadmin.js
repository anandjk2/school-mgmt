import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node --env-file=.env src/scripts/seed-superadmin.js <email> <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const { rowCount } = await pool.query(
  `INSERT INTO users (email, password_hash, role)
   VALUES ($1, $2, 'super_admin')
   ON CONFLICT DO NOTHING`,
  [email.toLowerCase().trim(), hash]
);

if (rowCount > 0) {
  console.log(`Super admin created: ${email}`);
} else {
  console.log(`Super admin already exists: ${email}`);
}

await pool.end();
