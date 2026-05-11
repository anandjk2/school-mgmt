-- 004_rls.sql: Link users to Supabase Auth + enable Row Level Security
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Link existing users table to Supabase Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_idx ON users(auth_id) WHERE auth_id IS NOT NULL;

-- 2. Helper functions (SECURITY DEFINER so they bypass RLS when called internally)
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

-- 3. Auto-set tenant_id on insert (so client doesn't need to pass it)
CREATE OR REPLACE FUNCTION public.auto_tenant_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.my_tenant_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trig_students_tid    BEFORE INSERT ON students        FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_classes_tid     BEFORE INSERT ON classes         FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_sc_tid          BEFORE INSERT ON student_classes FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_att_tid         BEFORE INSERT ON attendance      FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();
CREATE TRIGGER trig_fees_tid        BEFORE INSERT ON fees            FOR EACH ROW EXECUTE FUNCTION public.auto_tenant_id();

-- 4. Enable RLS on all tables
ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees            ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- tenants: super_admin only
CREATE POLICY "tenants_super_admin" ON tenants FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- users: own row + same tenant + super_admin all
CREATE POLICY "users_select" ON users FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR tenant_id = public.my_tenant_id() OR public.is_super_admin());
CREATE POLICY "users_insert" ON users FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());
CREATE POLICY "users_update" ON users FOR UPDATE TO authenticated
  USING (auth_id = auth.uid() OR public.is_super_admin());

-- students
CREATE POLICY "students_all" ON students FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

-- classes
CREATE POLICY "classes_all" ON classes FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

-- student_classes
CREATE POLICY "sc_all" ON student_classes FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

-- attendance
CREATE POLICY "att_all" ON attendance FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

-- fees
CREATE POLICY "fees_all" ON fees FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());

-- settings
CREATE POLICY "settings_all" ON settings FOR ALL TO authenticated
  USING (tenant_id = public.my_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.my_tenant_id() OR public.is_super_admin());
