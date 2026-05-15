-- Row Level Security (RLS) configuration for Snottyburger 2.0
-- Run this in Supabase SQL Editor after setting up Supabase Auth

-- Enable RLS on sensitive tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cart_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for promo_codes: Only admins can read/write
-- (Requires auth.jwt() ->> 'role' = 'admin' in your JWT claims)
CREATE POLICY "admin_only_promo_codes" ON public.promo_codes
  FOR ALL
  USING (
    (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'admin'
  );

-- Policy for promo_codes: Authenticated users can read active codes
CREATE POLICY "read_active_promo_codes" ON public.promo_codes
  FOR SELECT
  USING (is_active = true);

-- Policy for shared_cart_sessions: Only the owner can access their session
-- (This assumes you add user_id to shared_cart_sessions table)
-- CREATE POLICY "own_sessions" ON public.shared_cart_sessions
--   FOR ALL
--   USING (user_id = auth.uid());

-- Note: Shared carts use PIN-based access, not user auth
-- Consider adding a user_id column to track ownership if needed

-- Example admin_users table setup
-- CREATE TABLE public.admin_users (
--   id uuid references auth.users(id) on delete cascade primary key,
--   role text not null default 'user' check (role in ('admin', 'user')),
--   created_at timestamptz not null default now()
-- );

-- Enable RLS on admin_users
-- ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own record
-- CREATE POLICY "read_own_admin" ON public.admin_users
--   FOR SELECT
--   USING (id = auth.uid());
