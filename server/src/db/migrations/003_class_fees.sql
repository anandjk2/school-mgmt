-- Add tuition fee structure to classes
ALTER TABLE classes ADD COLUMN fee_amount      REAL    DEFAULT NULL;
ALTER TABLE classes ADD COLUMN billing_frequency TEXT   DEFAULT NULL
  CHECK(billing_frequency IN ('per_session','per_week','per_month'));

-- Link fee records to a class and record the billing frequency used
ALTER TABLE fees ADD COLUMN class_id          INTEGER REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE fees ADD COLUMN billing_frequency TEXT    DEFAULT NULL
  CHECK(billing_frequency IN ('per_session','per_week','per_month'));

CREATE INDEX IF NOT EXISTS idx_fees_class ON fees(class_id);
