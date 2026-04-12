import { Router } from 'express';
import db from '../db/connection.js';
import { ok } from '../utils/response.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = Router();

const profileSchema = z.object({
  school_name:   z.string().min(1),
  tagline:       z.string().optional().nullable(),
  address:       z.string().optional().nullable(),
  phone:         z.string().optional().nullable(),
  email:         z.string().email().optional().nullable(),
  website:       z.string().optional().nullable(),
  academic_year: z.string().optional().nullable(),
  currency:      z.string().optional(),
  logo_url:      z.string().optional().nullable(),
});

router.get('/', (req, res) => {
  ok(res, db.prepare('SELECT * FROM school_profile WHERE id = 1').get());
});

router.put('/', validate(profileSchema), (req, res) => {
  const { school_name, tagline, address, phone, email, website, academic_year, currency, logo_url } = req.body;
  db.prepare(`
    UPDATE school_profile SET
      school_name=?, tagline=?, address=?, phone=?, email=?, website=?,
      academic_year=?, currency=?, logo_url=?, updated_at=datetime('now')
    WHERE id=1
  `).run(school_name, tagline ?? null, address ?? null, phone ?? null,
         email ?? null, website ?? null, academic_year ?? null,
         currency ?? 'USD', logo_url ?? null);
  ok(res, db.prepare('SELECT * FROM school_profile WHERE id = 1').get());
});

export default router;
