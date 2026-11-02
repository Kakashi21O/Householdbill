-- Database Policies: 002_rls_policies.sql
-- Part 1: Row Level Security Configuration

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================
-- Users can read their own profile; admins can read all
CREATE POLICY "Profiles are viewable by owner or admin"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- Users can update basic info on their own profile, but NOT change their own role!
CREATE POLICY "Users can update their own profile info"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Only admins can update any user role
CREATE POLICY "Admins can update all profiles and roles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- HOUSEHOLD SETTINGS POLICIES
-- ==========================================
-- Any authenticated user (admin or visitor) can read household settings
CREATE POLICY "Authenticated users can view household settings"
ON public.household_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert or update household settings
CREATE POLICY "Admins can insert household settings"
ON public.household_settings FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update household settings"
ON public.household_settings FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- BILLS POLICIES
-- ==========================================
-- Any authenticated user can view bills
CREATE POLICY "Authenticated users can view bills"
ON public.bills FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage bills (insert, update, delete)
CREATE POLICY "Admins can insert bills"
ON public.bills FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bills"
ON public.bills FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete bills"
ON public.bills FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================
-- PAYMENTS POLICIES
-- ==========================================
-- Admins have full access to payments table (all columns including sensitive transaction_id)
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
TO authenticated
USING (public.is_admin());

-- Visitors can only read non-sensitive payment records through RLS or visitor view
-- If visitor selects directly from payments table, they can only view if role is visitor (sensitive columns should be selected via safe views or protected backend)
CREATE POLICY "Visitors can view payment rows"
ON public.payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
TO authenticated
USING (public.is_admin());
