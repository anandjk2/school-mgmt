/**
 * Migrates existing users from custom bcrypt auth to Supabase Auth.
 *
 * Prerequisites:
 *   1. Run 004_rls.sql in Supabase SQL Editor first.
 *   2. Get service_role key: Supabase Dashboard → Settings → API → service_role secret
 *
 * Usage:
 *   cd server
 *   node --env-file=.env src/scripts/migrate-to-supabase-auth.js <service_role_key>
 */

import pool from '../db/connection.js';
import { createClient } from '@supabase/supabase-js';

const [,, serviceRoleKey] = process.argv;

if (!serviceRoleKey) {
  console.error('Usage: node ... migrate-to-supabase-auth.js <service_role_key>');
  console.error('Get the key from: Supabase Dashboard → Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(
  'https://pmohworbqemmnfhvkyvg.supabase.co',
  serviceRoleKey
);

const { rows: users } = await pool.query(
  'SELECT id, email, role FROM users WHERE auth_id IS NULL ORDER BY created_at'
);

if (users.length === 0) {
  console.log('All users already migrated.');
  await pool.end();
  process.exit(0);
}

console.log(`Migrating ${users.length} user(s)...\n`);

for (const user of users) {
  const tempPassword = `SchoolMS_${Math.random().toString(36).slice(2, 10)}!`;

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (error) {
    console.error(`✗ ${user.email}: ${error.message}`);
    continue;
  }

  await pool.query('UPDATE users SET auth_id = $1 WHERE id = $2', [data.user.id, user.id]);
  console.log(`✓ ${user.email} (${user.role}) — temp password: ${tempPassword}`);
}

await pool.end();
console.log('\nDone. Users must log in with the temp passwords shown above.');
console.log('Use Supabase Dashboard → Authentication → Users to reset passwords if needed.');
