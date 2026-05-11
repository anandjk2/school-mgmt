-- 004_rls.sql: Link users to Supabase Auth + enable Row Level Security
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to re-run: all statements are idempotent.

-- ─── 1. Link users table to Supabase Auth ────────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id) WHERE auth_id IS NOT NULL;

-- ─── 2. Helper functions ──────────────────────────────────────────────────────
-- SECURITY DEFINER means these run as the function owner (bypasses RLS),
-- preventing infinite recursion when querying the users table.

CREATE OR REPLACE FUNCTION public.my_tenant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.users WHERE auth_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'super_admin'
  )
$$;

-- ─── 3. Auto-set tenant_id on insert ─────────────────────────────────────────
-- Only sets tenant_id when it is NULL and the caller is not a super_admin.
-- Super_admin inserts must supply tenant_id explicitly.

CREATE OR REPLACE FUNCTION public.auto_tenant_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  IF NEW.tenant_id IS NULL THEN
    v_tenant_id := public.my_tenant_id();
    IF v_tenant_id IS NULL THEN
      RAISE EXCEPTION 'tenant_id could not be determined for current user';
    END IF;
    NEW.tenant_id := v_tenant_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop triggers before (re)creating — CREATE TRIGGER has no IF NOT EXISTS
DROP TRIGGER IF EXISTS trig_students_tid    ON students;
DROP TRIGGER IF EXISTS trig_classes_tid     ON classes;
DROP TRIGGER IF EXISTS trig_sc_tid          ON student_classes;
DROP TRIGGER IF EXISTS trig_att_tid         ON attendance;
DROP TRIGGER IF EXISTS trig_fees_tid        ON fees;

CREATE TRIGGER trig_students_tid    BEFORE INSERT ON students        FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_classes_tid     BEFORE INSERT ON classes         FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_sc_tid          BEFORE INSERT ON student_classes FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_att_tid         BEFORE INSERT ON attendance      FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_fees_tid        BEFORE INSERT ON fees            FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();

-- ─── 4. Enable RLS ───────────────────────────────────────────────────────────

ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees            ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS Policies ─────────────────────────────────────────────────────────
-- Drop first so this script is safe to re-run.

DROP POLICY IF EXISTS "tenants_super_admin" ON tenants;
DROP POLICY IF EXISTS "users_select"        ON users;
DROP POLICY IF EXISTS "users_insert"        ON users;
DROP POLICY IF EXISTS "users_update"        ON users;
DROP POLICY IF EXISTS "students_all"        ON students;
DROP POLICY IF EXISTS "classes_all"         ON classes;
DROP POLICY IF EXISTS "sc_all"              ON student_classes;
DROP POLICY IF EXISTS "att_all"             ON attendance;
DROP POLICY IF EXISTS "fees_all"            ON fees;
DROP POLICY IF EXISTS "settings_all"        ON settings;

-- tenants: super_admin only
CREATE POLICY "tenants_super_admin" ON tenants FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- users: read own row or same-tenant rows; only super_admin can insert;
--        WITH CHECK on update prevents role/tenant escalation
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated
  USING  (auth_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (
    -- Prevent privilege escalation: regular users cannot change role or tenant_id
    public.is_super_admin()
    OR (role = (SELECT role FROM public.users WHERE auth_id = auth.uid())
        AND tenant_id = public.my_tenant_id())
  );

-- Data tables: strict tenant isolation
CREATE POLICY "students_all" ON students FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "classes_all" ON classes FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "sc_all" ON student_classes FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "att_all" ON attendance FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "fees_all" ON fees FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

CREATE POLICY "settings_all" ON settings FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());
