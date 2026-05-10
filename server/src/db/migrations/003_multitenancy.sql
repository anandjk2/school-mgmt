-- Tenants table (one row per school / organisation)
CREATE TABLE tenants (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  subdomain  TEXT        UNIQUE,
  status     TEXT        NOT NULL DEFAULT 'active'
                         CHECK(status IN ('active','inactive','suspended')),
  plan_tier  TEXT        NOT NULL DEFAULT 'free'
                         CHECK(plan_tier IN ('free','pro','enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (tenant_id IS NULL = super_admin)
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'admin'
                            CHECK(role IN ('super_admin','admin','teacher','student','parent')),
  first_name    TEXT        NOT NULL DEFAULT '',
  last_name     TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email unique per tenant
CREATE UNIQUE INDEX users_tenant_email_idx     ON users(tenant_id, email) WHERE tenant_id IS NOT NULL;
-- Super-admin email globally unique
CREATE UNIQUE INDEX users_superadmin_email_idx ON users(email)            WHERE tenant_id IS NULL;

-- Migrate existing data into a default tenant derived from current settings
DO $$
DECLARE
  v_tenant_id   UUID;
  v_school_name TEXT;
BEGIN
  SELECT value INTO v_school_name FROM settings WHERE key = 'school_name';
  v_school_name := COALESCE(v_school_name, 'Default School');

  INSERT INTO tenants (name, status, plan_tier)
  VALUES (v_school_name, 'active', 'free')
  RETURNING id INTO v_tenant_id;

  -- Drop old global unique on students.email; will be replaced by per-tenant index
  ALTER TABLE students DROP CONSTRAINT IF EXISTS students_email_key;

  -- Add tenant_id to all data tables
  ALTER TABLE students        ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE classes         ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE student_classes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE attendance      ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE fees            ADD COLUMN tenant_id UUID REFERENCES tenants(id);

  -- Backfill existing rows
  UPDATE students        SET tenant_id = v_tenant_id;
  UPDATE classes         SET tenant_id = v_tenant_id;
  UPDATE student_classes SET tenant_id = v_tenant_id;
  UPDATE attendance      SET tenant_id = v_tenant_id;
  UPDATE fees            SET tenant_id = v_tenant_id;

  -- Enforce NOT NULL now that backfill is done
  ALTER TABLE students        ALTER COLUMN tenant_id SET NOT NULL;
  ALTER TABLE classes         ALTER COLUMN tenant_id SET NOT NULL;
  ALTER TABLE student_classes ALTER COLUMN tenant_id SET NOT NULL;
  ALTER TABLE attendance      ALTER COLUMN tenant_id SET NOT NULL;
  ALTER TABLE fees            ALTER COLUMN tenant_id SET NOT NULL;

  -- Rebuild settings PK to be (tenant_id, key)
  ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey;
  ALTER TABLE settings ADD COLUMN tenant_id UUID REFERENCES tenants(id);
  UPDATE settings SET tenant_id = v_tenant_id;
  ALTER TABLE settings ALTER COLUMN tenant_id SET NOT NULL;
  ALTER TABLE settings ADD PRIMARY KEY (tenant_id, key);
END $$;

-- Per-tenant unique email for students
CREATE UNIQUE INDEX idx_students_tenant_email ON students(tenant_id, email) WHERE email IS NOT NULL;

-- Performance indexes
CREATE INDEX idx_students_tenant    ON students(tenant_id);
CREATE INDEX idx_classes_tenant     ON classes(tenant_id);
CREATE INDEX idx_sc_tenant          ON student_classes(tenant_id);
CREATE INDEX idx_attendance_tenant  ON attendance(tenant_id);
CREATE INDEX idx_fees_tenant        ON fees(tenant_id);
