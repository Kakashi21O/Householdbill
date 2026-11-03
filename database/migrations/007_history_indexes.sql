-- Migration 007: Performance indexes for Historical Records filtering and aggregations
-- Part 5 - Historical Records Management

-- 1. Index bills by billing_year, billing_month, category for historical reports & queries
CREATE INDEX IF NOT EXISTS idx_bills_year_month_cat ON public.bills(billing_year, billing_month, category);

-- 2. Index payments by payment_date for date-range historical queries
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date DESC);
