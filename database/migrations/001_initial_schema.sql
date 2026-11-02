-- Database Migration: 001_initial_schema.sql
-- Part 1: Foundation, Profiles, Household Settings, Bills, Payments & RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Auth Users Extension)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('admin', 'visitor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on email & role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Household Settings (Single or multi-household structure, default 1)
CREATE TABLE IF NOT EXISTS public.household_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_name TEXT NOT NULL DEFAULT 'My Household',
    currency TEXT NOT NULL DEFAULT 'INR',
    monthly_rent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    rent_due_day INT NOT NULL DEFAULT 5 CHECK (rent_due_day BETWEEN 1 AND 31),
    electricity_due_day INT NOT NULL DEFAULT 15 CHECK (electricity_due_day BETWEEN 1 AND 31),
    billing_start_month DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES public.household_settings(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('rent', 'electricity', 'other')),
    billing_month INT NOT NULL CHECK (billing_month BETWEEN 1 AND 12),
    billing_year INT NOT NULL CHECK (billing_year >= 2000),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Prevent duplicate monthly bills for identical category, household, and month/year
    CONSTRAINT unique_household_monthly_bill UNIQUE (household_id, category, billing_month, billing_year)
);

CREATE INDEX IF NOT EXISTS idx_bills_household_period ON public.bills(household_id, billing_year, billing_month);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Cash', 'NetBanking', 'Card', 'Other')),
    transaction_id TEXT,
    notes TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON public.payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

-- 5. Helper function for profile admin check (security definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 6. Trigger to automatically create profile on auth.user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'visitor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Public Safe Payment View for Visitors (hiding transaction_id & screenshot_url)
CREATE OR REPLACE VIEW public.visitor_payments_summary AS
SELECT 
    p.id,
    p.bill_id,
    p.amount,
    p.payment_date,
    p.payment_method,
    p.created_at
FROM public.payments p;
