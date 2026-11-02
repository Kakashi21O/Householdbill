-- Database Seed: 003_seed_household.sql
-- Part 1: Seed default household settings

INSERT INTO public.household_settings (household_name, currency, monthly_rent, rent_due_day, electricity_due_day, billing_start_month)
VALUES ('Main Residence', 'INR', 15000.00, 5, 15, '2026-01-01')
ON CONFLICT DO NOTHING;
