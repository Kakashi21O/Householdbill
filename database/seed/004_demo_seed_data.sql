-- Temporary Demo Seed: 004_demo_seed_data.sql
-- Household: Sunrise Residency | Rent: 10,500 | 2025 - 2026

DO $$
DECLARE
  v_house_id UUID;
  v_rent_id UUID;
  v_elec_id UUID;
BEGIN
  -- 1. Ensure Household Settings
  SELECT id INTO v_house_id FROM public.household_settings LIMIT 1;
  IF v_house_id IS NULL THEN
    INSERT INTO public.household_settings (household_name, currency, monthly_rent, rent_due_day, electricity_due_day, billing_start_month)
    VALUES ('Sunrise Residency', 'INR', 10500.00, 5, 10, '2025-01-01')
    RETURNING id INTO v_house_id;
  ELSE
    UPDATE public.household_settings
    SET household_name = 'Sunrise Residency', monthly_rent = 10500.00, rent_due_day = 5, electricity_due_day = 10
    WHERE id = v_house_id;
  END IF;

  -- 2. Clean existing demo bills/payments for sunrise residency if needed
  DELETE FROM public.bills WHERE household_id = v_house_id;

  -- 3. Insert 24 Months of Rent & Electricity Bills and associated Payments
  -- Helper macro via temp values
  CREATE TEMP TABLE temp_demo_data (
    yr INT, mo INT, elec NUMERIC(12,2), rent_paid NUMERIC(12,2), elec_paid NUMERIC(12,2)
  ) ON COMMIT DROP;

  INSERT INTO temp_demo_data VALUES
  -- 2025 (All settled up to Oct where partial elec, Nov/Dec settled)
  (2025, 1, 4850, 10500, 4850),
  (2025, 2, 4620, 10500, 4620),
  (2025, 3, 4950, 10500, 4950),
  (2025, 4, 5200, 10500, 5200),
  (2025, 5, 6100, 10500, 6100),
  (2025, 6, 6850, 10500, 6850),
  (2025, 7, 7200, 10500, 7200),
  (2025, 8, 6750, 10500, 6750),
  (2025, 9, 5900, 10500, 5900),
  (2025, 10, 5400, 10500, 3000), -- partial electricity
  (2025, 11, 4950, 10500, 4950),
  (2025, 12, 4700, 10500, 4700),
  -- 2026
  (2026, 1, 4900, 10500, 4900),
  (2026, 2, 4750, 10500, 4750),
  (2026, 3, 5100, 10500, 5100),
  (2026, 4, 5450, 10500, 5450),
  (2026, 5, 6300, 10500, 6300),
  (2026, 6, 7100, 10500, 7100),
  (2026, 7, 7350, 10500, 7350),
  (2026, 8, 6900, 10500, 6900),
  (2026, 9, 6100, 10500, 6100),
  (2026, 10, 6500, 10500, 6500),
  (2026, 11, 6070, 10500, 3000), -- Current Month: Rent Paid (10,500), Elec Partial (3,000 of 6,070)
  (2026, 12, 5200, 0, 0);        -- Projected / Future Month: Rent & Elec Unpaid

  -- Loop through and insert
  FOR rec IN SELECT * FROM temp_demo_data LOOP
    -- Insert Rent Bill
    INSERT INTO public.bills (household_id, category, billing_month, billing_year, amount, due_date)
    VALUES (v_house_id, 'rent', rec.mo, rec.yr, 10500.00, make_date(rec.yr, rec.mo, 5))
    RETURNING id INTO v_rent_id;

    -- Insert Rent Payment if paid
    IF rec.rent_paid > 0 THEN
      INSERT INTO public.payments (bill_id, amount, payment_date, payment_method, notes)
      VALUES (v_rent_id, rec.rent_paid, make_date(rec.yr, rec.mo, 5), 'UPI', 'Monthly rent payment');
    END IF;

    -- Insert Electricity Bill
    INSERT INTO public.bills (household_id, category, billing_month, billing_year, amount, due_date)
    VALUES (v_house_id, 'electricity', rec.mo, rec.yr, rec.elec, make_date(rec.yr, rec.mo, 10))
    RETURNING id INTO v_elec_id;

    -- Insert Electricity Payment if paid
    IF rec.elec_paid > 0 THEN
      INSERT INTO public.payments (bill_id, amount, payment_date, payment_method, notes)
      VALUES (v_elec_id, rec.elec_paid, make_date(rec.yr, rec.mo, 10), 'UPI', 'Electricity bill payment');
    END IF;
  END LOOP;

END $$;
