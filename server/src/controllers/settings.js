import db from '../db/connection.js';
import { ok } from '../utils/response.js';

const ALLOWED_KEYS = [
  'school_name', 'tagline', 'address', 'phone',
  'email', 'website', 'academic_year', 'principal_name',
];

export const getAll = (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = Object.fromEntries(rows.map(r => [r.key, r.value]));
  ok(res, obj);
};

export const updateAll = (req, res) => {
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const upsertAll = db.transaction((data) => {
    for (const key of ALLOWED_KEYS) {
      if (key in data) upsert.run(key, data[key] ?? '');
    }
  });
  upsertAll(req.body);
  const rows = db.prepare('SELECT key, value FROM settings').all();
  ok(res, Object.fromEntries(rows.map(r => [r.key, r.value])));
};
