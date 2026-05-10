import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node --env-file=.env src/scripts/reset-password.js <email> <new-password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const { rowCount } = await pool.query(
  `UPDATE users SET password_hash = $1 WHERE email = $2`,
  [hash, email.toLowerCase().trim()]
);

if (rowCount > 0) {
  console.log(`Password updated for: ${email}`);
} else {
  console.log(`No user found with email: ${email}`);
}

await pool.end();
