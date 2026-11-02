-- Database Migration: 005_add_bill_fields.sql
-- Part 3: Add title, issue_date, description to bills table

ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records if title is null
UPDATE public.bills
SET title = INITCAP(category) || ' - ' || TO_CHAR(TO_DATE(billing_month::text, 'MM'), 'Month') || ' ' || billing_year
WHERE title IS NULL;
