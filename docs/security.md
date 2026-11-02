# Security Architecture

## 1. Zero Secret Leaks
- Client code references only `NEXT_PUBLIC_` prefixed keys that are safe for browser consumption (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- `SUPABASE_SERVICE_ROLE_KEY` is never exposed or referenced in client-side bundles.

## 2. Row Level Security (RLS)
- `profiles`: Self-service updates cannot alter `role`. Only users with `is_admin()` can update roles.
- `household_settings`: Read allowed for authenticated users. Modification restricted to `is_admin()`.
- `bills`: Read allowed for authenticated users. Insert/Update/Delete restricted to `is_admin()`.
- `payments`: Modification restricted to `is_admin()`.

## 3. Safe Visitor View
The `visitor_payments_summary` database view is provided so that future visitor-facing interfaces can safely list payments without leaking `transaction_id` or `screenshot_url`.
