-- Add disenrolled_on to student_classes (soft disenrollment)
ALTER TABLE student_classes ADD COLUMN disenrolled_on TEXT;

-- Add fee_amount and billing_frequency to classes
ALTER TABLE classes ADD COLUMN fee_amount        REAL;
ALTER TABLE classes ADD COLUMN billing_frequency TEXT CHECK(billing_frequency IN ('per_session','per_week','per_month'));

-- Add class_id and billing_frequency to fees
ALTER TABLE fees ADD COLUMN class_id          INTEGER REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE fees ADD COLUMN billing_frequency TEXT CHECK(billing_frequency IN ('per_session','per_week','per_month'));

-- Key-value settings table (used by school profile / settings controller)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT ''
);

-- Seed default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('school_name',    'My School'),
  ('tagline',        ''),
  ('address',        ''),
  ('phone',          ''),
  ('email',          ''),
  ('website',        ''),
  ('academic_year',  '2024-2025'),
  ('principal_name', '')
