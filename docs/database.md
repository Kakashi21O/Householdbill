# Database Documentation — Part 1 Foundation

## Schema Design

### 1. `profiles`
Links directly to Supabase `auth.users`.
- `id` (UUID, PK): References `auth.users(id)`
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT)
- `role` (TEXT, NOT NULL): `'admin'` or `'visitor'`. Defaults to `'visitor'`.
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `household_settings`
Global configuration for the household.
- `id` (UUID, PK)
- `household_name` (TEXT, NOT NULL): e.g. "Main Residence"
- `currency` (TEXT, NOT NULL): Defaults to `'INR'`
- `monthly_rent` (NUMERIC(12,2), NOT NULL): Default fixed rent
- `rent_due_day` (INT): Day of month (1-31), default 5
- `electricity_due_day` (INT): Day of month (1-31), default 15
- `billing_start_month` (DATE)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 3. `bills`
Records of monthly bills.
- `id` (UUID, PK)
- `household_id` (UUID, FK -> `household_settings.id`)
- `category` (TEXT): `'rent'`, `'electricity'`, or `'other'`
- `billing_month` (INT): 1 - 12
- `billing_year` (INT): e.g. 2026
- `amount` (NUMERIC(12,2))
- `due_date` (DATE)
- Unique constraint: `(household_id, category, billing_month, billing_year)` to prevent duplicate bills.

### 4. `payments`
Tracks transactions.
- `id` (UUID, PK)
- `bill_id` (UUID, FK -> `bills.id`)
- `amount` (NUMERIC(12,2))
- `payment_date` (DATE)
- `payment_method` (TEXT): `'UPI'`, `'Cash'`, etc.
- `transaction_id` (TEXT, sensitive)
- `screenshot_url` (TEXT, sensitive)
- `notes` (TEXT)

## Security & RLS
- All tables enforce Row Level Security.
- Visitor role restricted from mutating any data or altering roles.
- `visitor_payments_summary` view filters out sensitive transaction IDs and payment proofs for non-admin viewers.
