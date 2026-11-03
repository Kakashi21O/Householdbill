-- Migration 006: Support 'Bank Transfer' in payments payment_method constraint
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_method_check 
  CHECK (payment_method IN ('UPI', 'Cash', 'Bank Transfer', 'NetBanking', 'Card', 'Other'));
